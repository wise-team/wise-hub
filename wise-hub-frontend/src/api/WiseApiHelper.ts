import * as steemJs from "steem";
import { Wise, EffectuatedSetRules, WiseSQLApi, DirectBlockchainApi, SteemOperationNumber } from "steem-wise-core";
import { d, i } from "../util/util";
import { data as wise } from "../wise-config.gen";

export class WiseApiHelper {
    public static ENDPOINT_URL = i(wise.config.sql.endpoint, (endpoint) => endpoint.schema + "://" + endpoint.host);
    private static API = new WiseSQLApi(WiseApiHelper.ENDPOINT_URL, Wise.constructDefaultProtocol(), new DirectBlockchainApi(Wise.constructDefaultProtocol()));

    public static async accountExists(username: string): Promise<boolean> {
        const steem = new steemJs.api.Steem({ url: wise.config.steem.defaultApiUrl });
        const accountInfo: steemJs.AccountInfo [] = await steem.getAccountsAsync([ username ]);
        return accountInfo.length > 0;
    }
}
