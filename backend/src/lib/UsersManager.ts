import { Vault } from "./vault/Vault";
import { Redis } from "ioredis";
import { User, defaultUserSettings, UserSettings } from "../common/model/User";
import { common } from "../common/common";
import { d } from "./util";
import * as jwt_decode from "jwt-decode";
import { DelegatorManager } from "./DelegatorManager";


export class UsersManager {
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

        await this.setUser(username, user);
        if (accessToken) await this.setAccessToken(username, accessToken);
        if (refreshToken) await this.setRefreshToken(username, refreshToken);

        return user;
    }

    public async logout(user: User) {
        const username = d(user.account);
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

    private async getUser(username: string): Promise<User | undefined> {
        const secretKey = common.vault.secrets.hub.userProfiles + "/" + username;
        const resp: { v: User } | undefined = await this.vault.getSecret(secretKey);
        return (resp ? resp.v : undefined);
    }

    private async setUser(username: string, user: User) {
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

    private async setAccessToken(username: string, accessToken: string) {
        const secretKey = common.vault.secrets.hub.accessTokens + "/" + username;
        await this.vault.setSecret(secretKey, { v: accessToken });
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

    private async setRefreshToken(username: string, refreshToken: string) {
        const secretKey = common.vault.secrets.hub.refreshTokens + "/" + username;
        await this.vault.setSecret(secretKey, { v: refreshToken });
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
    && (<RefreshTokenJWTPayload>o).iat !== undefined;
}