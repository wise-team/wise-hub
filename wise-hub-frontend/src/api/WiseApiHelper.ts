import * as BluebirdPromise from "bluebird";
import * as steem from "steem";
import { Wise, EffectuatedSetRules, WiseSQLApi, DirectBlockchainApi, SteemOperationNumber } from "steem-wise-core";
import { d, i } from "../util/util";
import { data as wise } from "../wise-config.gen";

export class WiseApiHelper {
    public static ENDPOINT_URL = i(wise.config.sql.endpoint, (endpoint) => endpoint.schema + "://" + endpoint.host);
    private static API = new WiseSQLApi(WiseApiHelper.ENDPOINT_URL, Wise.constructDefaultProtocol(), new DirectBlockchainApi(Wise.constructDefaultProtocol()));

    public static async loadRulesets(props: { delegator?: string, voter?: string }): Promise<EffectuatedSetRules []> {
        return WiseApiHelper.API.loadRulesets({ voter: props.voter, delegator: props.delegator }, SteemOperationNumber.FUTURE);
    }
}
