import { Wise, EffectuatedSetRules, WiseSQLApi, DirectBlockchainApi, SteemOperationNumber, SetRulesForVoter } from "steem-wise-core";
import { d, i } from "../../../util/util";
import { BuildContext } from "../../../BuildContext";
import { WindowContext } from "../../../WindowContext";
import Axios from "axios";

export class RulesetsModuleApiHelper {
    private static API = new WiseSQLApi(WindowContext.WISE_SQL_ENDPOINT_URL, Wise.constructDefaultProtocol(), new DirectBlockchainApi(Wise.constructDefaultProtocol()));

    public static async loadRulesets(props: { delegator?: string, voter?: string }): Promise<EffectuatedSetRules []> {
        return RulesetsModuleApiHelper.API.loadRulesets({ voter: props.voter, delegator: props.delegator }, SteemOperationNumber.FUTURE);
    }

    public static async saveSetRules(srfv: SetRulesForVoter): Promise<{ id: string; block_num: number; trx_num: number; }> {
        const resp = await Axios.post("/api/rulesets/publish", srfv);
        return resp.data;
    }
}