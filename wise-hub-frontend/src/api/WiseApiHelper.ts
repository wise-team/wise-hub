import * as steemJs from "steem";
import { Wise, EffectuatedSetRules, WiseSQLApi, DirectBlockchainApi, SteemOperationNumber, EffectuatedWiseOperation } from "steem-wise-core";
import { d, i } from "../util/util";
import { BuildContext } from "../BuildContext";
import Axios from "axios";
import { DaemonLogEntry } from "./DaemonLogEntry";
import { WindowContext } from "../WindowContext";

export class WiseApiHelper {
    private static ENDPOINT_URL = WindowContext.WISE_SQL_ENDPOINT_URL;

    public static async getLog(delegator?: string): Promise<DaemonLogEntry []> {
        try {
            const resp = await Axios.get("/api/daemon/log" + (delegator ? "/" + delegator : ""));
            return resp.data.map((entry: string) => JSON.parse(entry));
        }
        catch (error) {
            if (error.response.status === 404) return [];
            else throw error;
        }
    }
}
