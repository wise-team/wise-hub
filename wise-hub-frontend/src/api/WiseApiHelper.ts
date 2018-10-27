import * as steemJs from "steem";
import { Wise, EffectuatedSetRules, WiseSQLApi, DirectBlockchainApi, SteemOperationNumber } from "steem-wise-core";
import { d, i } from "../util/util";
import { data as wise } from "../wise-config.gen";
import { BuildContext } from "../BuildContext";

export class WiseApiHelper {
    private static API = new WiseSQLApi(BuildContext.WISE_SQL_ENDPOINT_URL, Wise.constructDefaultProtocol(), new DirectBlockchainApi(Wise.constructDefaultProtocol()));
}
