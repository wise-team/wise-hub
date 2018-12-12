import Axios from "axios";
import ow from "ow";
import * as steemJs from "steem";
import { Wise, EffectuatedSetRules, WiseSQLApi, DirectBlockchainApi, SteemOperationNumber } from "steem-wise-core";
import { d, i } from "../../../util/util";
import { BuildContext } from "../../../BuildContext";
import { WindowContext } from "../../../WindowContext";
import { consts } from "../../../consts";
import { User, UserSettings } from "./User";

export class AuthModuleApiHelper {
    public static async accountExists(username: string): Promise<boolean> {
        const steem = new steemJs.api.Steem({ url: WindowContext.STEEMD_ENDPOINT_URL });
        const accountInfo: steemJs.AccountInfo [] = await steem.getAccountsAsync([ username ]);
        return accountInfo.length > 0;
    }

    public static getLoginUrl(scope: AuthModuleApiHelper.LoginScope): string {
        ow(scope, ow.string.label("scope").oneOf(AuthModuleApiHelper.scopes));
        return scope;
    }

    public static async getUser(): Promise<User | false> {
        try {
            const resp = await Axios.get(consts.urls.api.user.base);
            const user: User = resp.data;
            User.validate(user);
            return user;
        }
        catch (error) {
            if (error.response.status === 401) return false;
            else throw error;
        }
    }

    public static async saveUserSettings(settings: UserSettings) {
        UserSettings.validate(settings);

        const saveResp = await Axios.post(consts.urls.api.user.settings, settings);
        console.log("Saved settings, response= " + JSON.stringify(saveResp));
    }

    public static async logout() {
        await Axios.get(consts.urls.api.auth.logout);
    }
}

export namespace AuthModuleApiHelper {
    export type LoginScope = string;

    export const LoginScope_EMPTY: LoginScope = consts.urls.api.auth.login.scope.empty;
    export const LoginScope_CUSTOM_JSON: LoginScope = consts.urls.api.auth.login.scope.custom_json;
    export const LoginScope_CUSTOM_JSON_VOTE_OFFLINE: LoginScope = consts.urls.api.auth.login.scope.custom_json_vote_offline;
    export const scopes = [
        LoginScope_EMPTY,
        LoginScope_CUSTOM_JSON,
        LoginScope_CUSTOM_JSON_VOTE_OFFLINE
    ];
}
