import Axios from "axios";
import { Redis } from "ioredis";
import * as jwt_decode from "jwt-decode";
import * as _ from "lodash";
import ow from "ow";
import { OperationWithDescriptor } from "steem";

import { common } from "../common/common";
import { defaultUserSettings, User, UserSettings } from "../common/model/User";

import { DelegatorManager } from "./DelegatorManager";
import { Log } from "./Log";
import { Steemconnect } from "./Steemconnect";
import { UsersManagerI } from "./UsersManagerI";
import { d } from "./util";
import { Vault } from "./vault/Vault";

// TODO: Move process.env management to root file and pass only arguments
export class UsersManager implements UsersManagerI {
    private oauth2ClientId: string;
    private oauth2Settings = /*§ JSON.stringify(data.config.steemconnect.oauth2Settings, undefined, 2) §*/ {
        baseAuthorizationUrl: "https://steemconnect.com/oauth2/authorize",
        tokenUrl: "https://steemconnect.com/api/oauth2/token",
        tokenRevocationUrl: "https://steemconnect.com/api/oauth2/token/revoke",
    } /*§ §.*/;

    private options: UsersManagerOptions;
    private vault: Vault;
    private redis: Redis;
    private steemconnect: Steemconnect;

    public constructor(redis: Redis, vault: Vault, options: UsersManagerOptions) {
        this.vault = vault;
        this.redis = redis;
        this.options = options;

        const oauth2ClientIdEnv = process.env.OAUTH2_CLIENT_ID;
        if (!oauth2ClientIdEnv) throw new Error("Env OAUTH2_CLIENT_ID is missing");
        this.oauth2ClientId = oauth2ClientIdEnv;

        this.steemconnect = new Steemconnect(this.oauth2ClientId, "-callback-url-required-only-for-login-");
    }

    public async init() {
        //
    }

    // tslint:disable cyclomatic-complexity
    public async login(accessToken: string, refreshToken?: string): Promise<User> {
        if (!accessToken) throw new Error("Access token is missing");

        const me: Steemconnect.Me = await this.steemconnect.me(accessToken);
        const username = d(me.name);

        const getUser: User | undefined = await this.getUser(username);
        const user: User = {
            account: username,
            profile: me || (getUser ? getUser.profile : ({} as any)),
            scope: _.union([], me.scope || [], getUser ? getUser.scope : []),
            settings: _.merge({}, defaultUserSettings, getUser ? getUser.settings : {}),
        };

        if (accessToken) {
            const tokenPayload = await this.setAccessToken(username, accessToken);
            user.scope = _.merge(user.scope || [], tokenPayload.scope);
        }

        if (refreshToken) {
            const tokenPayload = await this.setRefreshToken(username, refreshToken);
            user.scope = _.merge(user.scope || [], tokenPayload.scope);
        } else {
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

        Log.log().info(
            "Logged in @" + me.name + " with retrived scope = " + me.scope + ", and escalated scope = " + user.scope,
        );
        return user;
    }
    // tslint:enable cyclomatic-complexity

    public async forgetUser(user: User) {
        const username = d(user.account);
        const accessToken = await this.getAccessToken(username);

        if (accessToken) {
            await this.steemconnect.revokeToken(accessToken.token);
        }

        await this.deleteAccessToken(username);
        await this.deleteRefreshToken(username);
    }

    public async broadcast(
        username: string,
        scope: string[],
        ops: OperationWithDescriptor[],
    ): Promise<Steemconnect.BroadcastResult> {
        ow(username, ow.string.nonEmpty.label("username"));
        ow(scope, ow.array.nonEmpty.ofType(ow.string).label("scope"));
        ow(ops, ow.array.nonEmpty.ofType(ow.object).label("ops"));

        let accessToken = await this.getAccessToken(username);
        if (!accessToken) throw new Error('User "' + username + "\"'s access token not found in vault!");

        scope.forEach(requiredScopeElem => {
            if (d(accessToken).payload.scope.indexOf(requiredScopeElem) === -1) {
                throw new Error("This access token does not allow " + requiredScopeElem + " in its scope");
            }
        });

        if (Date.now() / 1000 >= accessToken.payload.exp || this.options.debug_refreshAccessTokenOnEverySCConstruct) {
            accessToken = await this.refreshAccessToken(username, scope);
        }

        return await this.steemconnect.broadcast(username, scope, ops, accessToken.token);
    }

    public async saveUserSettings(username: string, settings: UserSettings): Promise<User> {
        const user: User | undefined = await this.getUser(username);
        if (!user) throw new Error('User "' + username + '" does not exist');
        user.settings = settings;

        await this.setUser(username, user);
        return d(await this.getUser(username));
    }

    public async getUser(username: string): Promise<User | undefined> {
        const secretKey = common.vault.secrets.hub.userProfiles + "/" + username;
        const resp: { v: User } | undefined = await this.vault.getSecret(secretKey);
        return resp ? resp.v : undefined;
    }

    private async refreshAccessToken(
        username: string,
        scope: string[],
    ): Promise<{ token: string; payload: AccessTokenJWTPayload }> {
        if (!this.options.canIssueRefreshTokens) {
            throw new Error("This users manager has canIssueRefreshTokens set to false.");
        }
        const refreshToken = await this.getRefreshToken(username);
        if (!refreshToken) throw new Error("User " + username + " does not have a refresh token");

        scope.forEach(requiredScopeElem => {
            if (refreshToken.payload.scope.indexOf(requiredScopeElem) === -1) {
                throw new Error("This refresh token does not allow " + requiredScopeElem + " in its scope");
            }
        });

        const steemConnectSecret: { v: string } = await this.vault.getSecret(
            common.vault.secrets.steemConnectClientSecret,
        );
        if (!steemConnectSecret) throw new Error("Could not get SteemConnect client secret");

        const resp = await Axios.post(this.oauth2Settings.tokenUrl, {
            refresh_token: refreshToken.token,
            client_id: this.oauth2ClientId,
            client_secret: d(steemConnectSecret.v),
            scope: refreshToken.payload.scope.join(","),
        });
        const data: { access_token: string } = d(resp.data);
        const accessToken = d(data.access_token);
        await this.setAccessToken(username, accessToken);
        return d(await this.getAccessToken(username));
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
        } else {
            await DelegatorManager.removeDelegator(this.redis, username);
        }
    }

    private async getAccessToken(
        username: string,
    ): Promise<{ token: string; payload: AccessTokenJWTPayload } | undefined> {
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
        } catch (error) {
            if (error.response.status === 404) return undefined;
            else throw error;
        }
    }

    private async getRefreshToken(
        username: string,
    ): Promise<{ token: string; payload: RefreshTokenJWTPayload } | undefined> {
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
        } catch (error) {
            if (error.response.status === 404) return undefined;
            else throw error;
        }
    }

    /*private createEphemericSC2(): sc2.SteemConnectV2 {
        return sc2.Initialize({
            app: this.oauth2ClientId,
            callbackURL: steemconnectCallbackUrlEnv,
            scope: [], // in this manager we do not perform any scoped operations
        });
    }*/
}

export interface UsersManagerOptions {
    canIssueRefreshTokens: boolean;
    debug_refreshAccessTokenOnEverySCConstruct?: boolean;
}

interface AccessTokenJWTPayload {
    role: string; // =app
    proxy: string; // =wisevote.app
    user: string;
    scope: string[];
    iat: number;
    exp: number;
}

/**
 * This is an TS 1.6+ TypeGuard as described here: https://www.typescriptlang.org/docs/handbook/advanced-types.html
 */
function isAccessTokenJWTPayload(o: object): o is AccessTokenJWTPayload {
    return (
        (o as AccessTokenJWTPayload).role !== undefined &&
        (o as AccessTokenJWTPayload).role === "app" &&
        (o as AccessTokenJWTPayload).proxy !== undefined &&
        (o as AccessTokenJWTPayload).user !== undefined &&
        (o as AccessTokenJWTPayload).scope !== undefined &&
        Array.isArray((o as AccessTokenJWTPayload).scope) &&
        (o as AccessTokenJWTPayload).iat !== undefined &&
        (o as AccessTokenJWTPayload).exp !== undefined
    );
}

interface RefreshTokenJWTPayload {
    role: string; // =app
    proxy: string; // =wisevote.app
    user: string;
    scope: string[];
    iat: number;
}

/**
 * This is an TS 1.6+ TypeGuard as described here: https://www.typescriptlang.org/docs/handbook/advanced-types.html
 */
function isRefreshTokenJWTPayload(o: object): o is RefreshTokenJWTPayload {
    return (
        (o as RefreshTokenJWTPayload).role !== undefined &&
        (o as AccessTokenJWTPayload).role === "refresh" &&
        (o as RefreshTokenJWTPayload).proxy !== undefined &&
        (o as RefreshTokenJWTPayload).user !== undefined &&
        (o as RefreshTokenJWTPayload).scope !== undefined &&
        Array.isArray((o as RefreshTokenJWTPayload).scope) &&
        (o as RefreshTokenJWTPayload).iat !== undefined &&
        (o as AccessTokenJWTPayload).exp /* !!! */ === /* !!! */ undefined
    );
}
