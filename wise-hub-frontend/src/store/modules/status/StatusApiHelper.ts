import Axios from "axios";
import * as steem from "steem";
import { data as wise } from "../../../wise-config.gen";
import { d } from "../../../util/util";

export class StatusApiHelper {
    public static async isVoting(accountName: string): Promise<boolean> {
        const query = "/operations?delegator=eq." + d(accountName) + "&operation_type=eq.set_rules&select=count";
        const result = await Axios.get(wise.config.sql.endpoint.schema + "://" + wise.config.sql.endpoint.host + query);
        return d(result.data[0].count) > 0;
    }

    public static async isDelegating(accountName: string): Promise<boolean> {
        const query = "/operations?voter=eq." + d(accountName) + "&operation_type=eq.send_voteorder&select=count";
        const result = await Axios.get(wise.config.sql.endpoint.schema + "://" + wise.config.sql.endpoint.host + query);
        return d(result.data[0].count) > 0;
    }

    public static async isSupporting(accountName: string): Promise<boolean> {
        const result = await steem.api.getAccountsAsync([ d(accountName) ]);
        if (result.length < 1) throw new Error("Account " + accountName + "doesnt exist!");
        else {
            return d(result[0].witness_votes).filter((witness: string) => witness === wise.config.witness.account).length > 0;
        }
    }
}