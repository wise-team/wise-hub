import { Wise, EffectuatedSetRules, WiseSQLApi, DirectBlockchainApi, SteemOperationNumber, SetRulesForVoter } from "steem-wise-core";
import { d, i } from "../../../util/util";
import { BuildContext } from "../../../BuildContext";
import { WindowContext } from "../../../WindowContext";
import Axios from "axios";
import ow from "ow";

export class RulesetsModuleApiHelper {
    private static API = new WiseSQLApi(WindowContext.WISE_SQL_ENDPOINT_URL, Wise.constructDefaultProtocol(), new DirectBlockchainApi(Wise.constructDefaultProtocol()));

    public static async loadRulesets(props: { delegator?: string, voter?: string }): Promise<EffectuatedSetRules []> {
        ow(props.delegator, ow.any(ow.undefined, ow.string.minLength(3).label("props.delegator")));
        ow(props.voter, ow.any(ow.undefined, ow.string.minLength(3).label("props.voter")));
        ow(props, ow.object.is((props: any) => !!props.voter || !!props.delegator || `Props ${props} must either include a voter or a delegator`))

        return RulesetsModuleApiHelper.API.loadRulesets({ voter: props.voter, delegator: props.delegator }, SteemOperationNumber.FUTURE);
    }

    public static async saveSetRules(srfv: SetRulesForVoter): Promise<{ id: string; block_num: number; trx_num: number; }> {
        SetRulesForVoter.validateSetRulesForVoter(srfv);

        const resp = await Axios.post("/api/rulesets/publish", srfv);
        if (!resp.data || !resp.data.id) throw new Error("Invalid response on save rules: " + JSON.stringify(resp.data));
        const result = resp.data;

        ow(result.id, ow.string.minLength(10).label("result.id"));
        ow(result.block_num, ow.number.greaterThanOrEqual(0).label("result.block_num"));
        ow(result.trx_num, ow.number.greaterThanOrEqual(0).label("result.trx_num"));
        return result;
    }
}