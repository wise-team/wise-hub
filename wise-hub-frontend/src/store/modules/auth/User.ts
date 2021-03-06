import * as steem from "steem";
import * as _ from "lodash";
import ow from "ow";

export interface User {
    account: string;
    profile:
        | undefined
        | {
              name: string;
              account: steem.AccountInfo;
              user_metadata: any;
          };
    scope: string[];
    settings?: UserSettings;
}

export namespace User {
    export function validate(user: User) {
        ow(user.account, ow.string.minLength(3).label(".account"));
        ow(user.scope, ow.array.label(".scope").ofType(ow.string));
        if (user.settings) UserSettings.validate(user.settings);

        if (user.profile) {
            ow(user.profile.name, ow.string.minLength(3).label(".profile.name"));
            ow(
                user.profile.account,
                ow.object
                    .label(".profile.account")
                    .hasKeys("witness_votes", "witnesses_voted_for", "voting_power", "reputation")
            );

            // do not rely on this value, as it is
            /*ow(user.profile.scope, ow.array.label(".profile.scope").ofType(ow.string)
                .is((scope: string []) => _.xor(scope, user.scope).length == 0 || `.profile.scope is not equal to .scope`));*/
        }
    }
}

export interface UserSettings {
    daemonEnabled: boolean;
}

export namespace UserSettings {
    export function validate(userSettings: UserSettings) {
        ow(userSettings.daemonEnabled, ow.boolean.label("userSettings.daemonEnabled"));
    }
}

/**
 * This is an TS 1.6+ TypeGuard as described here: https://www.typescriptlang.org/docs/handbook/advanced-types.html
 */
export function isUserSettings(o: object): o is UserSettings {
    return (<UserSettings>o).daemonEnabled !== undefined;
}

export const defaultUserSettings = {
    daemonEnabled: false,
};
