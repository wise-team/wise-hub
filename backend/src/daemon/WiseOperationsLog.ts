import { Redis } from "ioredis";
import { ApiHelper } from "./ApiHelper";
import { Log } from "../lib/Log";
import { WiseSQLProtocol, EffectuatedWiseOperation } from "steem-wise-core";
import Axios from "axios";
import { common } from "../common/common";

export class WiseOperationsLog {
    public static async preload(redis: Redis, apiHelper: ApiHelper) {
        // (async () => {
            try {
                await WiseOperationsLog.doPreload(redis, apiHelper);
            }
            catch (error) {
                Log.log().logError("daemon/WiseOperationsLog.ts failed to preload wise operations", error);
            }
        // });
    }

    private static async doPreload(redis: Redis, apiHelper: ApiHelper) {
        if ((await redis.exists(common.redis.wiseOperationsLog)) > 0) {
            const wiseOpsLen = await redis.llen(common.redis.wiseOperationsLog);
            if (wiseOpsLen > 0) {
                Log.log().info("WiseLOG already initialized (llen=" + wiseOpsLen + "). Skip preloading");
                return;
            }
        }
        Log.log().info("WiseLOG not initialized. Preloading wiseSQL with operations");
        let ops: EffectuatedWiseOperation [] = await apiHelper.getWiseSQL("/operations", { order: "moment.desc" }, 500);
        ops = ops.reverse();
        for (let i = 0; i < ops.length; i++) {
            const op: EffectuatedWiseOperation = ops[i];
            const wiseOpStr: string = JSON.stringify(op);
            await redis.lpush(common.redis.wiseOperationsLog, wiseOpStr);
            await redis.ltrim(common.redis.wiseOperationsLog, 0, common.daemonLog.maxHistoryLength);
        }
    }
}