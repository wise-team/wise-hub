import { Vault } from "./vault/Vault";
import { Redis } from "ioredis";
import { User, defaultUserSettings, UserSettings } from "../common/model/User";
import { common } from "../common/common";
import { d } from "./util";
import * as jwt_decode from "jwt-decode";
import * as sc2 from "steemconnect";
import { DelegatorManager } from "./DelegatorManager";


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
        let user: User = {
            account: username,
            profile: user_.profile,
            scope: user_.scope || [],
            settings: user_.settings || defaultUserSettings
        };

        const getUser: User | undefined = await this.getUser(username);
        if (getUser) {
            user = {
                account: username,
                profile: user.profile || getUser.profile,
                scope: user.scope || getUser.scope,
                settings: user.settings || getUser.settings || defaultUserSettings
            };
        }

        if (accessToken) {
            const tokenPayload = await this.setAccessToken(username, accessToken);
            user.scope = tokenPayload.scope;
        }
        if (refreshToken) {
            const tokenPayload = await this.setRefreshToken(username, refreshToken);
            user.scope = tokenPayload.scope;
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
        await this.vault.setSecret(secretKey, { v: user });

        if (user.settings.daemonEnabled) {
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
    && (<RefreshTokenJWTPayload>o).proxy !== undefined
    && (<RefreshTokenJWTPayload>o).user !== undefined
    && (<RefreshTokenJWTPayload>o).scope !== undefined
    && Array.isArray((<RefreshTokenJWTPayload>o).scope)
    && (<RefreshTokenJWTPayload>o).iat !== undefined
    && (<AccessTokenJWTPayload>o).exp /* !!! */ === /* !!! */ undefined;
}