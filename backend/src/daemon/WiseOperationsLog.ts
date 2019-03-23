import { Redis } from "ioredis";
import { EffectuatedWiseOperation } from "steem-wise-core";

import { common } from "../common/common";
import { Log } from "../lib/Log";

import { ApiHelper } from "./ApiHelper";

export class WiseOperationsLog {
    public static async preload(redis: Redis, apiHelper: ApiHelper) {
        try {
            await WiseOperationsLog.doPreload(redis, apiHelper);
        } catch (error) {
            Log.log().error("daemon/WiseOperationsLog.ts failed to preload wise operations", error);
        }
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
        let ops: EffectuatedWiseOperation[] = await apiHelper.getWiseSQL("/operations", { order: "moment.desc" }, 500);
        ops = ops.reverse();
        for (const op of ops) {
            const wiseOpStr: string = JSON.stringify(op);
            await redis.lpush(common.redis.wiseOperationsLog, wiseOpStr);
            await redis.ltrim(common.redis.wiseOperationsLog, 0, common.daemonLog.maxHistoryLength);
        }
    }
}
