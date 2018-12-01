import { Vault } from "./vault/Vault";
import { Redis } from "ioredis";
import { User, defaultUserSettings, UserSettings } from "../common/model/User";
import { common } from "../common/common";
import { d } from "./util";
import * as jwt_decode from "jwt-decode";
import * as sc2 from "steemconnect";
import * as _ from "lodash";
import { DelegatorManager } from "./DelegatorManager";
import Axios from "axios";
import { Log } from "./Log";


export class UsersManager {
    private oauth2ClientId: string = /*§ §*/"wisevote.app"/*§ JSON.stringify(data.config.steemconnect.settings.client_id)  §.*/;
    private oauth2Settings = /*§ JSON.stringify(data.config.steemconnect.oauth2Settings, undefined, 2) §*/{
  "baseAuthorizationUrl": "https://steemconnect.com/oauth2/authorize",
  "tokenUrl": "https://steemconnect.com/api/oauth2/token",
  "tokenRevocationUrl": "https://steemconnect.com/api/oauth2/token/revoke"
}/*§ §.*/;

    private options: UsersManagerOptions;
    private vault: Vault;
    private redis: Redis;

    public constructor(redis: Redis, vault: Vault, options: UsersManagerOptions) {
        this.vault = vault;
        this.redis = redis;
        this.options = options;
    }

    public async init() {
    }

    public async login(user_: User, accessToken: string, refreshToken: string): Promise<User> {
        if (!accessToken) throw new Error("Access token is missing");

        const username = d(user_.account);

        const getUser: User | undefined = await this.getUser(username);
        const user: User = {
            account: username,
            profile:
                   user_.profile
                || (getUser ? getUser.profile : {} as any),
            scope: _.union(
                [],
                user_.scope || [],
                (getUser ? getUser.scope : [])
            ),
            settings: _.merge(
                {},
                defaultUserSettings,
                (getUser ? getUser.settings : {}),
                user_.settings || {}
            )
        };

        if (accessToken) {
            const tokenPayload = await this.setAccessToken(username, accessToken);
            user.scope = _.merge(user.scope || [], tokenPayload.scope);
        }

        if (refreshToken) {
            const tokenPayload = await this.setRefreshToken(username, refreshToken);
            user.scope = _.merge(user.scope || [], tokenPayload.scope);
        }
        else {
            // do not let narrower scoped access token override previous wide scope access token
            // instead, we get wider scoped access token by refreshing old access token
            const gotRefreshToken = await this.getRefreshToken(username);
            if (gotRefreshToken && this.options.canIssueRefreshTokens) {
                const betterAccessToken = await this.refreshAccessToken(username, gotRefreshToken.payload.scope);
                await this.setAccessToken(username, betterAccessToken.token);
                user.scope = _.merge(user.scope || [], gotRefreshToken.payload.scope);
            }
        }

        await this.setUser(username, user);

        return user;
    }

    public async logout(user: User) {
        const username = d(user.account);
        const accessToken = await this.getAccessToken(username);

        if (accessToken) {
            const sc2 = this.createEphemericSC2();
            sc2.setAccessToken(accessToken.token);
            await new Promise<any>((resolve, reject) => {
                sc2.revokeToken((err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
        }

        await this.deleteAccessToken(username);
        await this.deleteRefreshToken(username);
    }

    public async constructOfflineSteemConnect(username: string, scope: string []): Promise<sc2.SteemConnectV2> {
        let accessToken = await this.getAccessToken(username);
        if (!accessToken) throw new Error("User \"" + username + "\" not found!");

        scope.forEach(requiredScopeElem => {
            if (d(accessToken).payload.scope.indexOf(requiredScopeElem) === -1) {
                throw new Error("This access token does not allow " + requiredScopeElem + " in its scope");
            }
        });

        if ((Date.now() / 1000) >= accessToken.payload.exp || this.options.debug_refreshAccessTokenOnEverySCConstruct) {
            accessToken = await this.refreshAccessToken(username, scope);
        }

        const sc =  sc2.Initialize({
            app: this.oauth2ClientId,
            callbackURL: undefined,
            scope: scope,
        });
        sc.setAccessToken(accessToken.token);
        return sc;
    }

    private async refreshAccessToken(username: string, scope: string []): Promise<{ token: string, payload: AccessTokenJWTPayload }> {
        if (!this.options.canIssueRefreshTokens) throw new Error("This users manager has canIssueRefreshTokens set to false.");
        const refreshToken = await this.getRefreshToken(username);
        if (!refreshToken) throw new Error("User " + username + " does not have a refresh token");

        scope.forEach(requiredScopeElem => {
            if (refreshToken.payload.scope.indexOf(requiredScopeElem) === -1) {
                throw new Error("This refresh token does not allow " + requiredScopeElem + " in its scope");
            }
        });

        const steemConnectSecret: { v: string } = await this.vault.getSecret(common.vault.secrets.steemConnectClientSecret);
        if (!steemConnectSecret) throw new Error("Could not get SteemConnect client secret");

        const resp = await Axios.post(this.oauth2Settings.tokenUrl, {
            refresh_token: refreshToken.token,
            client_id: this.oauth2ClientId,
            client_secret: d(steemConnectSecret.v),
            scope: refreshToken.payload.scope.join(",")
        });
        const data: { access_token: string } = d(resp.data);
        const accessToken = d(data.access_token);
        await this.setAccessToken(username, accessToken);
        return d(await this.getAccessToken(username));
    }

    public async saveUserSettings(username: string, settings: UserSettings): Promise<User> {
        const user: User | undefined = await this.getUser(username);
        if (!user) throw new Error("User \"" + username + "\" does not exist");
        user.settings = settings;

        await this.setUser(username, user);
        return d(await this.getUser(username));
    }

    public async getUser(username: string): Promise<User | undefined> {
        const secretKey = common.vault.secrets.hub.userProfiles + "/" + username;
        const resp: { v: User } | undefined = await this.vault.getSecret(secretKey);
        return (resp ? resp.v : undefined);
    }

    private async setUser(username: string, user: User) {
        // TODO user object can be a huge object. Check if encryption time in vault isnt issue
        const secretKey = common.vault.secrets.hub.userProfiles + "/" + username;

        // const prevUserObject = await this.vault.getSecret(secretKey);
        // if (prevUserObject) console.log("prevUserObject=" + JSON.stringify(prevUserObject, undefined, 2));
        // const newUser = prevUserObject ? _.merge(prevUserObject.v, user) : user;
        // console.log("newUser=" + JSON.stringify(newUser, undefined, 2));
        await this.vault.setSecret(secretKey, { v: user });

        if (user.settings && user.settings.daemonEnabled) {
            await DelegatorManager.addDelegator(this.redis, username);
        }
        else {
            await DelegatorManager.removeDelegator(this.redis, username);
        }
    }

    private async getAccessToken(username: string): Promise<{ token: string, payload: AccessTokenJWTPayload } | undefined> {
        const secretKey = common.vault.secrets.hub.accessTokens + "/" + username;
        const resp: { v: string } | undefined = await this.vault.getSecret(secretKey);
        if (!resp) return undefined;

        const jwtPayload = jwt_decode(d(resp.v));
        if (!isAccessTokenJWTPayload(jwtPayload)) throw new Error("This token is not AccessTokenJWTPayload");
        return { token: d(resp.v), payload: jwtPayload as AccessTokenJWTPayload };
    }

    private async setAccessToken(username: string, accessToken: string): Promise<AccessTokenJWTPayload> {
        const jwtPayload = jwt_decode(accessToken);
        if (!isAccessTokenJWTPayload(jwtPayload)) throw new Error("This token is not AccessTokenJWTPayload");

        const secretKey = common.vault.secrets.hub.accessTokens + "/" + username;
        await this.vault.setSecret(secretKey, { v: accessToken });

        return jwtPayload;
    }

    private async deleteAccessToken(username: string) {
        try {
            const secretKey = common.vault.secrets.hub.accessTokens + "/" + username;
            await this.vault.deleteSecret(secretKey);
        }
        catch (error) {
            if (error.response.status === 404) return undefined;
            else throw error;
        }
    }

    private async getRefreshToken(username: string): Promise<{ token: string, payload: RefreshTokenJWTPayload } | undefined> {
        const secretKey = common.vault.secrets.hub.refreshTokens + "/" + username;
        const resp: { v: string } | undefined = await this.vault.getSecret(secretKey);
        if (!resp) return undefined;

        const jwtPayload = jwt_decode(d(resp.v));
        if (!isRefreshTokenJWTPayload(jwtPayload)) throw new Error("This token is not RefreshTokenJWTPayload");
        return { token: d(resp.v), payload: jwtPayload as RefreshTokenJWTPayload };
    }

    private async setRefreshToken(username: string, refreshToken: string): Promise<RefreshTokenJWTPayload> {
        const jwtPayload = jwt_decode(refreshToken);
        if (!isRefreshTokenJWTPayload(jwtPayload)) throw new Error("This token is not RefreshTokenJWTPayload");

        const secretKey = common.vault.secrets.hub.refreshTokens + "/" + username;
        await this.vault.setSecret(secretKey, { v: refreshToken });

        return jwtPayload;
    }

    private async deleteRefreshToken(username: string) {
        try {
            const secretKey = common.vault.secrets.hub.refreshTokens + "/" + username;
            await this.vault.deleteSecret(secretKey);
        }
        catch (error) {
            if (error.response.status === 404) return undefined;
            else throw error;
        }
    }

    private createEphemericSC2(): sc2.SteemConnectV2 {
        const steemconnectCallbackUrlEnv = process.env.STEEMCONNECT_CALLBACK_URL;
        if (!steemconnectCallbackUrlEnv) throw new Error("Env STEEMCONNECT_CALLBACK_URL is missing");

        return sc2.Initialize({
            app: this.oauth2ClientId,
            callbackURL: steemconnectCallbackUrlEnv,
            scope: [], // in this manager we do not perform any scoped operations
        });
    }
}

export interface UsersManagerOptions {
    canIssueRefreshTokens: boolean;
    debug_refreshAccessTokenOnEverySCConstruct?: boolean;
}

interface AccessTokenJWTPayload {
    role: string; // =app
    proxy: string; // =wisevote.app
    user: string;
    scope: string [];
    iat: number;
    exp: number;
}

/**
 * This is an TS 1.6+ TypeGuard as described here: https://www.typescriptlang.org/docs/handbook/advanced-types.html
 */
function isAccessTokenJWTPayload(o: object): o is AccessTokenJWTPayload {
    return (<AccessTokenJWTPayload>o).role !== undefined
    && (<AccessTokenJWTPayload>o).role === "app"
    && (<AccessTokenJWTPayload>o).proxy !== undefined
    && (<AccessTokenJWTPayload>o).user !== undefined
    && (<AccessTokenJWTPayload>o).scope !== undefined
    && Array.isArray((<AccessTokenJWTPayload>o).scope)
    && (<AccessTokenJWTPayload>o).iat !== undefined
    && (<AccessTokenJWTPayload>o).exp !== undefined;
}

interface RefreshTokenJWTPayload {
    role: string; // =app
    proxy: string; // =wisevote.app
    user: string;
    scope: string [];
    iat: number;
}

/**
 * This is an TS 1.6+ TypeGuard as described here: https://www.typescriptlang.org/docs/handbook/advanced-types.html
 */
function isRefreshTokenJWTPayload(o: object): o is RefreshTokenJWTPayload {
    return (<RefreshTokenJWTPayload>o).role !== undefined
    && (<AccessTokenJWTPayload>o).role === "refresh"
    && (<RefreshTokenJWTPayload>o).proxy !== undefined
    && (<RefreshTokenJWTPayload>o).user !== undefined
    && (<RefreshTokenJWTPayload>o).scope !== undefined
    && Array.isArray((<RefreshTokenJWTPayload>o).scope)
    && (<RefreshTokenJWTPayload>o).iat !== undefined
    && (<AccessTokenJWTPayload>o).exp /* !!! */ === /* !!! */ undefined;
}