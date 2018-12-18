import ow from "ow";
import * as steemJs from "steem";
import { d } from "../../../util/util";
import { StatusModule } from "./StatusModule";
import { BuildContext } from "../../../BuildContext";
import { WindowContext } from "../../../WindowContext";
import { WiseSQLProtocol, EffectuatedWiseOperation } from "steem-wise-core";
import { WiseApiHelper } from "../../../api/WiseApiHelper";

export class StatusApiHelper {
    private static WITNESS_ACCOUNT = /*§ §*/ "wise-team" /*§ ' "' + data.config.witness.account + '" ' §.*/;
    private static ENDPOINT_URL = WindowContext.WISE_SQL_ENDPOINT_URL;
    private static STEEM: steemJs.api.Steem = new steemJs.api.Steem({ url: WindowContext.STEEMD_ENDPOINT_URL });

    public static async loadGeneralStats(): Promise<{ operations: number; delegators: number; voters: number; }> {
        const query = "/stats";
        const resp = await WiseApiHelper.queryApi({ method: "GET", url: StatusApiHelper.ENDPOINT_URL + query });
        const result = { operations: d(resp.data[0].operations), delegators: d(resp.data[0].delegators), voters: d(resp.data[0].voters) };

        ow(result.operations, ow.number.label("result.operations").greaterThanOrEqual(0));
        ow(result.delegators, ow.number.label("result.delegators").greaterThanOrEqual(0));
        ow(result.voters, ow.number.label("result.voters").greaterThanOrEqual(0));
        return result;
    }

    public static async isVoting(accountName: string): Promise<boolean> {
        ow(accountName, ow.string.label("accountName").minLength(3));

        const query = "/operations?voter=eq." + d(accountName) + "&operation_type=eq.send_voteorder&select=count";
        const resp = await WiseApiHelper.queryApi({ method: "GET", url: StatusApiHelper.ENDPOINT_URL + query });
        ow(resp.data[0].count, ow.number.greaterThanOrEqual(0));

        const result = d(resp.data[0].count) > 0;

        ow(result, ow.boolean.label("result"));
        return result;
    }

    public static async isDelegating(accountName: string): Promise<boolean> {
        ow(accountName, ow.string.label("accountName").minLength(3));

        const query = "/operations?delegator=eq." + d(accountName) + "&operation_type=eq.set_rules&select=count";
        const resp = await WiseApiHelper.queryApi({ method: "GET", url: StatusApiHelper.ENDPOINT_URL + query });
        ow(resp.data[0].count, ow.number.greaterThanOrEqual(0));

        const result = d(resp.data[0].count) > 0;

        ow(result, ow.boolean.label("result"));
        return result;
    }

    public static async isSupporting(accountName: string): Promise<boolean> {
        ow(accountName, ow.string.label("accountName").minLength(3));

        const result = await StatusApiHelper.STEEM.getAccountsAsync([ d(accountName) ]);
        if (result.length < 1) throw new Error("Account " + accountName + "doesnt exist!");
        else {
            return d(result[0].witness_votes).filter((witness: string) => witness === StatusApiHelper.WITNESS_ACCOUNT).length > 0;
        }
    }

    public static async loadLatestOperations(limit: number = 50): Promise<EffectuatedWiseOperation []> {
        ow(limit, ow.number.label("limit").greaterThan(0));

        const operations: EffectuatedWiseOperation [] = await WiseSQLProtocol.Handler.query({
            endpointUrl: StatusApiHelper.ENDPOINT_URL,
            path: "/operations",
            params: { order: "moment.desc" },
            method: "get",
            limit: limit
        });
        ow(operations, ow.array.label("operations").ofType(ow.object));

        return operations;
    }
}