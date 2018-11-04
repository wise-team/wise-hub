
import * as steem from "steem";

export interface User {
    account: string;
    profile: undefined | {
        name: string;
        account: steem.AccountInfo;
        scope: string [];
        user_metadata: any;
    };
    scope: string [];
    settings: UserSettings;
}

export interface UserSettings {
    daemonEnabled: boolean;
}

/**
 * This is an TS 1.6+ TypeGuard as described here: https://www.typescriptlang.org/docs/handbook/advanced-types.html
 */
export function isUserSettings(o: object): o is UserSettings {
    return (<UserSettings>o).daemonEnabled !== undefined;
}

export const defaultUserSettings = {
    daemonEnabled: false
};