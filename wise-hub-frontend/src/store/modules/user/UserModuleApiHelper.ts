import * as steemJs from "steem";
import { Wise, EffectuatedSetRules, WiseSQLApi, DirectBlockchainApi, SteemOperationNumber } from "steem-wise-core";
import { d, i } from "../../../util/util";
import { data as wise } from "../../../wise-config.gen";
import { BuildContext } from "../../../BuildContext";

export class UserModuleApiHelper {
    public static async accountExists(username: string): Promise<boolean> {
        const steem = new steemJs.api.Steem({ url: wise.config.steem.defaultApiUrl });
        const accountInfo: steemJs.AccountInfo [] = await steem.getAccountsAsync([ username ]);
        return accountInfo.length > 0;
    }
}
