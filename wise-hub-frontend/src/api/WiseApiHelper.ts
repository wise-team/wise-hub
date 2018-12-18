import * as steemJs from "steem";
import * as _ from "lodash";
import ow from "ow";
import { Wise, EffectuatedSetRules, WiseSQLApi, DirectBlockchainApi, SteemOperationNumber, EffectuatedWiseOperation } from "steem-wise-core";
import { d, i } from "../util/util";
import { BuildContext } from "../BuildContext";
import Axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { DaemonLogEntry } from "./DaemonLogEntry";
import { WindowContext } from "../WindowContext";

export class WiseApiHelper {
    private static ENDPOINT_URL = WindowContext.WISE_SQL_ENDPOINT_URL;
    public static SQL_API: WiseSQLApi = new WiseSQLApi(WiseApiHelper.ENDPOINT_URL, Wise.constructDefaultProtocol());

    public static async getLog(delegator?: string): Promise<DaemonLogEntry []> {
        try {
            const resp = await WiseApiHelper.queryApi({ method: "GET", url: "/api/daemon/log" + (delegator ? "/" + delegator : "") });
            return resp.data.map((entry: string) => JSON.parse(entry));
        }
        catch (error) {
            if (error.response.status === 404) return [];
            else throw error;
        }
    }

    public static async getOperationsLog(account?: string): Promise<EffectuatedWiseOperation []> {
        try {
            const resp = await WiseApiHelper.queryApi({ method: "GET", url: "/api/daemon/operations/log" });
            if (account && account.length > 0) {
                return resp.data.map((entry: string) => JSON.parse(entry) as EffectuatedWiseOperation)
                .filter((op: EffectuatedWiseOperation) => op.delegator === account || op.voter === account);
            }
            else {
                return resp.data.map((entry: string) => JSON.parse(entry));
            }
        }
        catch (error) {
            if (error.response.status === 404) return [];
            else throw error;
        }
    }

    public static async queryApi(req: AxiosRequestConfig): Promise<AxiosResponse> {
        ow(req.method, ow.string.label("req.method").oneOf([ "GET", "POST", "PUT", "LIST" ]));
        ow(req.url, ow.string.nonEmpty.label("req.url"));

        try {
            return await Axios(req);
        }
        catch (error) {
            if (error.response && error.response.data && error.response.data.errors) {
                throw new Error(_.get(error, "response.status", "Response") + " error: " + error.response.data.errors.join(","));
            }
            else if (error.response && error.response.data) {
                throw new Error(_.get(error, "response.status", "Response") + " error: " + JSON.stringify(error.response.data));
            }
            else throw error;
        }
    }
}
