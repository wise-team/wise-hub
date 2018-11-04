/* tslint:disable:no-null-keyword */
import * as BluebirdPromise from "bluebird";
import * as express from "express";
import * as passport from "passport";
import * as sc2 from "steemconnect";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as OAuth2Strategy } from "passport-oauth2";
import { User, defaultUserSettings } from "../../common/model/User";
import { Vault } from "../../lib/vault/Vault";
import { common } from "../../common/common";
import { asyncReq } from "../lib/util";
import { UsersManager } from "../../lib/UsersManager";
import { Log } from "../../lib/Log";

export class AuthManager {
    private oauth2ClientId: string = /*§ §*/"wisevote.app"/*§ JSON.stringify(data.config.steemconnect.settings.client_id)  §.*/;
    private oauth2Settings = /*§ JSON.stringify(data.config.steemconnect.oauth2Settings, undefined, 2) §*/{
  "baseAuthorizationUrl": "https://steemconnect.com/oauth2/authorize",
  "tokenUrl": "https://steemconnect.com/api/oauth2/token",
  "tokenRevocationUrl": "https://steemconnect.com/api/oauth2/token/revoke"
}/*§ §.*/;
    private defaultScope: string [] = [ "custom_json", "offline" ];

    private steemconnectCallbackUrl: string;
    private loginRedirectUrl: string;

    private vault: Vault;
    private usersManager: UsersManager;

    public constructor(vault: Vault, usersManager: UsersManager) {
        this.vault = vault;
        this.usersManager = usersManager;

        const steemconnectCallbackUrlEnv = process.env.STEEMCONNECT_CALLBACK_URL;
        if (!steemconnectCallbackUrlEnv) throw new Error("Env STEEMCONNECT_CALLBACK_URL is missing");
        this.steemconnectCallbackUrl = steemconnectCallbackUrlEnv;

        const loginRedirectUrlEnv = process.env.LOGIN_REDIRECT_URL;
        if (!loginRedirectUrlEnv) throw new Error("Env LOGIN_REDIRECT_URL is missing");
        this.loginRedirectUrl = loginRedirectUrlEnv;
    }

    public async configure(app: express.Application) {
        const steemConnectSecret: { v: string } = await this.vault.getSecret(common.vault.secrets.steemConnectClientSecret);

        passport.use(new OAuth2Strategy({
                authorizationURL: this.oauth2Settings.baseAuthorizationUrl,
                tokenURL: this.oauth2Settings.tokenUrl,
                clientID: this.oauth2ClientId,
                clientSecret: steemConnectSecret.v,
                callbackURL: this.steemconnectCallbackUrl,
                scope: this.defaultScope,
                scopeSeparator: ","
            } as any,
            (accessToken: string, refreshToken: string, profile: any,  cb: (error: any, user: any) => void) => {
                (async () => {
                    try {
                        console.log("Performing login");
                        const user: User = await this.performLogin(accessToken, refreshToken);
                        console.log("Call back");
                        return cb(undefined, user);
                    }
                    catch (error) {
                        Log.log().exception(Log.level.error, error);
                        return cb(error, undefined);
                    }
                })();
            }
        ));

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
        app.get("/api/auth/",
            passport.authenticate("oauth2")
        );

        app.get("/api/auth/callback",
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

        app.get("/api/auth/test_login",
            AuthManager.isUserAuthenticated,
            (req, res) => {
                res.send(JSON.stringify({ authorized: true }));
            }
        );

        app.get("/api/auth/logout",
            AuthManager.isUserAuthenticated,
            (req, res) => asyncReq(res, async () => {
                await this.usersManager.logout(req.user);
                const sc2 = this.createEphemericSC2();
                await new Promise<any>((resolve, reject) => {
                    sc2.revokeToken((err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                        console.log("REVOKE=" + JSON.stringify(result));
                    });
                });
                req.logout();
                res.send(JSON.stringify({ logout: true }));
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

    private createEphemericSC2(): sc2.SteemConnectV2 {
        return sc2.Initialize({
            app: this.oauth2ClientId,
            callbackURL: this.steemconnectCallbackUrl,
            scope: this.defaultScope,
        });
    }

    private async performLogin(accessToken: string, refreshToken: string): Promise<User> {
        const sc2 = this.createEphemericSC2();
        sc2.setAccessToken(accessToken);
        const me: { account: object, user_metadata: object } =
            await new Promise<any>((resolve, reject) => {
                sc2.me((error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                });
            });
        const user: User = await this.usersManager.login({
            scope: this.defaultScope,
            account: "jblew",
            profile: me,
            settings: defaultUserSettings
        }, accessToken, refreshToken);
        return user;
    }
}