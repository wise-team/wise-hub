import * as steemJs from "steem";
import { Wise, EffectuatedSetRules, WiseSQLApi, DirectBlockchainApi, SteemOperationNumber } from "steem-wise-core";
import { d, i } from "../../../util/util";
import { BuildContext } from "../../../BuildContext";
import { WindowContext } from "../../../WindowContext";

export class UserModuleApiHelper {
    public static async accountExists(username: string): Promise<boolean> {
        const steem = new steemJs.api.Steem({ url: WindowContext.STEEMD_ENDPOINT_URL });
        const accountInfo: steemJs.AccountInfo [] = await steem.getAccountsAsync([ username ]);
        return accountInfo.length > 0;
    }
}
