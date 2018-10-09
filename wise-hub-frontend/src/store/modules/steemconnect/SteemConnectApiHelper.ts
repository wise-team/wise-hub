/* tslint:disable member-ordering no-console */
import * as sc2 from "steemconnect";
import * as BluebirdPromise from "bluebird";
import { data as wise } from "../../../wise-config.gen";
import { d } from "../../../util/util";
import { queryParams } from "../../../util/url-util";

export class SteemConnectApiHelper {
    private static LS_ACCESS_TOKEN_KEY = "ec2accesstoken";
    private static SC2_APP_ACCOUNT = "wisevote.app";
    private static SC2_CALLBACK_URL: string = (location.hostname === "localhost" || location.hostname === "127.0.0.1" ?
                                            "http://localhost:8080/" : d(wise.config.hub.production.schema) + "://" + d(wise.config.hub.production.host));
    private static SC2_SCOPE: string [] = ["custom_json"];

    public static getLoginUrl(): string {
        return "https://steemconnect.com/oauth2/authorize"
        + "?client_id=" + SteemConnectApiHelper.SC2_APP_ACCOUNT
        + "&redirect_uri=" + encodeURIComponent(SteemConnectApiHelper.SC2_CALLBACK_URL)
        + "&scope=" + SteemConnectApiHelper.SC2_SCOPE.join(",");
    }

    public static async initialize(): Promise<string | false> {
        const accessToken = SteemConnectApiHelper.getAccessToken();
        if (queryParams.access_token && accessToken) {
            localStorage.setItem(SteemConnectApiHelper.LS_ACCESS_TOKEN_KEY, accessToken);
            window.location.search = "";
        }

        if (accessToken) return accessToken;
        else return false;
    }

    public static async loadAccount(): Promise<{ id: string; name: string; json_metadata: string; } | false> {
        const accessToken = SteemConnectApiHelper.getAccessToken();
        if (!accessToken) return false;

        const steemConnectV2 = SteemConnectApiHelper.getSteemConnectObject();
        steemConnectV2.setAccessToken(accessToken);
        
        const result: { account: object, user_metadata: object } = (await new BluebirdPromise((resolve, reject) => {
            steemConnectV2.me((error: Error, result: { account: object, user_metadata: object }) => {
                if (error) reject(error);
                else resolve(result);
            });
        })) as any;
        if (result && result.account) return result.account as { id: string, name: string, json_metadata: string };
        else return false;
    }

    public static async logout() {
        const accessToken = SteemConnectApiHelper.getAccessToken();
        if (!accessToken) return;

        const steemConnectV2 = SteemConnectApiHelper.getSteemConnectObject();
        steemConnectV2.setAccessToken(accessToken);
        await new BluebirdPromise((resolve, reject) => {
            steemConnectV2.revokeToken((error: Error, result: any) => {
                if (error) reject(error);
                else resolve(result);
            });
        });
        
        localStorage.removeItem(SteemConnectApiHelper.LS_ACCESS_TOKEN_KEY);
        window.location.href = SteemConnectApiHelper.SC2_CALLBACK_URL;
    }

    // TODO: promisify
    /*public static broadcast(operations: object [], callback: (error: Error | undefined, result: any) => void) {
        const accessToken = this.getAccessToken();
        if (accessToken) {
            const steemConnectV2 = SteemConnectApiHelper.getSteemConnectObject();
            steemConnectV2.setAccessToken(accessToken);
            steemConnectV2.broadcast(operations, (error: Error | undefined, result: any) => {
                if (error) callback(error, undefined);
                else callback(undefined, result);
            });
        } else {
            callback(new Error("Not logged in to SteemConnect."), undefined);
        }
    }*/

    private static getSteemConnectObject(): sc2.SteemConnectV2 {
        return sc2.Initialize({
            app: SteemConnectApiHelper.SC2_APP_ACCOUNT,
            callbackURL: SteemConnectApiHelper.SC2_CALLBACK_URL,
            scope: SteemConnectApiHelper.SC2_SCOPE,
        });
    }

    public static getAccessToken(): string | null {
        return queryParams.access_token
            || localStorage.getItem(SteemConnectApiHelper.LS_ACCESS_TOKEN_KEY);
    }
}
