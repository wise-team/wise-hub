import Axios from "axios";
import * as steemJs from "steem";
import { data as wise } from "../../../wise-config.gen";
import { d } from "../../../util/util";
import { StatusModule } from "./StatusModule";
import { BuildContext } from "../../../BuildContext";

export class StatusApiHelper {
    private static ENDPOINT_URL = BuildContext.WISE_SQL_ENDPOINT_URL;
    private static STEEM: steemJs.api.Steem = new steemJs.api.Steem({ url: wise.config.steem.defaultApiUrl });

    public static async loadGeneralStats(): Promise<{ operations: number; delegators: number; voters: number; }> {
        const query = "/stats";
        const result = await Axios.get(StatusApiHelper.ENDPOINT_URL + query);
        return { operations: d(result.data[0].operations), delegators: d(result.data[0].delegators), voters: d(result.data[0].voters) }
    }

    public static async isVoting(accountName: string): Promise<boolean> {
        const query = "/operations?delegator=eq." + d(accountName) + "&operation_type=eq.set_rules&select=count";
        const result = await Axios.get(StatusApiHelper.ENDPOINT_URL + query);
        return d(result.data[0].count) > 0;
    }

    public static async isDelegating(accountName: string): Promise<boolean> {
        const query = "/operations?voter=eq." + d(accountName) + "&operation_type=eq.send_voteorder&select=count";
        const result = await Axios.get(StatusApiHelper.ENDPOINT_URL + query);
        return d(result.data[0].count) > 0;
    }

    public static async isSupporting(accountName: string): Promise<boolean> {
        const result = await StatusApiHelper.STEEM.getAccountsAsync([ d(accountName) ]);
        if (result.length < 1) throw new Error("Account " + accountName + "doesnt exist!");
        else {
            return d(result[0].witness_votes).filter((witness: string) => witness === wise.config.witness.account).length > 0;
        }
    }

    public static async loadLatestOperations(): Promise<StatusModule.WiseOperation []> {
        const query = "/operations?order=moment.desc&limit=" + wise.config.hub.visual.read.lastActivity.numOfOpsToShow;
        const result = await Axios.get(StatusApiHelper.ENDPOINT_URL + query);

        const operations: StatusModule.WiseOperation [] = [];

        result.data.forEach((op: any) => {
            const wiseOp: StatusModule.WiseOperation = {
                id: op.id,
                block_num: op.block_num,
                transaction_num: op.transaction_num,
                transaction_id: op.transaction_id,
                timestamp: op.timestamp,
                moment: op.moment,
                voter: op.voter,
                delegator: op.delegator,
                operation_type: op.operation_type,
                json_str: op.json_str,
                data: JSON.parse(op.json_str)
            };
            operations.push(wiseOp);
        });

        return operations;
    }
}