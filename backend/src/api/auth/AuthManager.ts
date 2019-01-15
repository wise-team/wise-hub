/* tslint:disable:no-null-keyword */
import * as BluebirdPromise from "bluebird";
import * as express from "express";
import * as passport from "passport";
import ow from "ow";
import { d } from "../lib/util";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as OAuth2Strategy } from "passport-oauth2";
import { User, defaultUserSettings, UserSettings } from "../../common/model/User";
import { Vault } from "../../lib/vault/Vault";
import { common } from "../../common/common";
import { asyncReq } from "../lib/util";
import { UsersManager } from "../../lib/UsersManager";
import { Log } from "../../lib/Log";
import { AccountInfo } from "steem";
import { Steemconnect } from "../../lib/Steemconnect";

// TODO: Move process.env management to root file and pass only arguments
export class AuthManager {
    private oauth2Settings = /*§ JSON.stringify(data.config.steemconnect.oauth2Settings, undefined, 2) §*/ {
        baseAuthorizationUrl: "https://steemconnect.com/oauth2/authorize",
        tokenUrl: "https://steemconnect.com/api/oauth2/token",
        tokenRevocationUrl: "https://steemconnect.com/api/oauth2/token/revoke",
    } /*§ §.*/;

    private steemconnectCallbackUrl: string;
    private loginRedirectUrl: string;
    private oauth2ClientId: string; // JSON.stringify(data.config.steemconnect.app.production.settings.client_id)

    private vault: Vault;
    private usersManager: UsersManager;
    private steemconnect: Steemconnect;

    public constructor(vault: Vault, usersManager: UsersManager) {
        ow(vault, ow.object.label("vault"));
        ow(usersManager, ow.object.label("usersManager"));

        this.vault = vault;
        this.usersManager = usersManager;

        const oauth2ClientIdEnv = process.env.OAUTH2_CLIENT_ID;
        if (!oauth2ClientIdEnv) throw new Error("Env OAUTH2_CLIENT_ID is missing");
        ow(oauth2ClientIdEnv, ow.string.minLength(2).label("oauth2ClientIdEnv"));
        this.oauth2ClientId = oauth2ClientIdEnv;

        const steemconnectCallbackUrlEnv = process.env.STEEMCONNECT_CALLBACK_URL;
        if (!steemconnectCallbackUrlEnv) throw new Error("Env STEEMCONNECT_CALLBACK_URL is missing");
        ow(
            steemconnectCallbackUrlEnv,
            ow.any(
                ow.string
                    .minLength(5)
                    .startsWith("https://")
                    .label("STEEMCONNECT_CALLBACK_URL"),
                ow.string
                    .minLength(5)
                    .startsWith("http://localhost")
                    .label("STEEMCONNECT_CALLBACK_URL")
            )
        );
        this.steemconnectCallbackUrl = steemconnectCallbackUrlEnv;

        const loginRedirectUrlEnv = process.env.LOGIN_REDIRECT_URL;
        if (!loginRedirectUrlEnv) throw new Error("Env LOGIN_REDIRECT_URL is missing");
        ow(loginRedirectUrlEnv, ow.string.minLength(1).label("loginRedirectUrlEnv"));
        this.loginRedirectUrl = loginRedirectUrlEnv;

        this.steemconnect = new Steemconnect(this.oauth2ClientId, this.steemconnectCallbackUrl);
    }

    public async configure(app: express.Application) {
        const steemConnectSecret: { v: string } = await this.vault.getSecret(
            common.vault.secrets.steemConnectClientSecret
        );
        if (!(steemConnectSecret && steemConnectSecret.v && steemConnectSecret.v.length > 0))
            throw new Error("Missing SteemConnect client secret");

        passport.use(
            new OAuth2Strategy(
                {
                    authorizationURL: this.oauth2Settings.baseAuthorizationUrl,
                    tokenURL: this.oauth2Settings.tokenUrl,
                    clientID: this.oauth2ClientId,
                    clientSecret: steemConnectSecret.v,
                    callbackURL: this.steemconnectCallbackUrl,
                    scope: [],
                    scopeSeparator: ",",
                    state: true,
                } as any,
                (accessToken: string, refreshToken: string, profile: any, cb: (error: any, user: any) => void) => {
                    (async () => {
                        try {
                            const user: User = await this.performLogin(accessToken, refreshToken);
                            return cb(undefined, user);
                        } catch (error) {
                            Log.log().logError("AuthManager.configure.passport.callback", error);
                            return cb(error, undefined);
                        }
                    })();
                }
            )
        );

        passport.serializeUser(function(user, done) {
            done(null, user);
        });

        passport.deserializeUser(function(user, done) {
            done(null, user);
        });

        app.use(passport.initialize());
        app.use(passport.session());
    }

    public routes(app: express.Application) {
        app.get(common.urls.api.auth.login.scope.empty, passport.authenticate("oauth2", { scope: ["login"] }));

        app.get(
            common.urls.api.auth.login.scope.custom_json,
            passport.authenticate("oauth2", { scope: ["custom_json"] })
        );

        app.get(
            common.urls.api.auth.login.scope.custom_json_vote_offline,
            passport.authenticate("oauth2", { scope: ["custom_json", "vote", "offline"] })
        );

        app.get(
            common.urls.api.auth.callback,
            passport.authenticate("oauth2", {
                failureRedirect: this.loginRedirectUrl + "?msg=" + encodeURIComponent("Login failed"),
                successRedirect: this.loginRedirectUrl + "?msg=" + encodeURIComponent("Login succeeded"),
            }),
            (req, res) => {
                Log.log().warn("Express/passport should not proceed here");
                // Successful authentication, redirect home.
                res.redirect(this.loginRedirectUrl);
            }
        );

        app.get(common.urls.api.auth.test_login, AuthManager.isUserAuthenticated, (req, res) => {
            res.send(JSON.stringify({ authorized: true }));
        });

        app.get(common.urls.api.auth.logout, AuthManager.isUserAuthenticated, (req, res) =>
            asyncReq("api/auth/AuthManager.ts route logout", res, async () => {
                req.logout();
                res.send(JSON.stringify({ logout: true, revoke_all: false }));
            })
        );

        app.get(common.urls.api.auth.revoke_all, AuthManager.isUserAuthenticated, (req, res) =>
            asyncReq("api/auth/AuthManager.ts route revoke_all", res, async () => {
                await this.usersManager.forgetUser(d(req.user));
                req.logout();
                res.send(JSON.stringify({ logout: true, revoke_all: true }));
            })
        );
    }

    public static isUserAuthenticated(req: express.Request, res: express.Response, next: express.NextFunction) {
        if (req.user) {
            next();
        } else {
            res.status(401);
            res.send(JSON.stringify({ error: "Unauthorized", advice: "Login required" }));
        }
    }

    private async performLogin(accessToken: string, refreshToken: string): Promise<User> {
        const user: User = await this.usersManager.login(accessToken, refreshToken);
        return user;
    }
}
