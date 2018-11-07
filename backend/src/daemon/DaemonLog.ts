import * as Redis from "ioredis";
import { common } from "../common/common";
import { Log } from "../lib/Log";
import { EffectuatedWiseOperation } from "steem-wise-core";
// import { d } from "../lib/util";

export class DaemonLog {
    private redis: Redis.Redis;

    public constructor(redis: Redis.Redis) {
        this.redis = redis;
    }

    public emit(msg: LogMessage, delegator?: string) {
        (async () => {
            try {
                msg.time = Date.now();
                if (msg.delegator) {
                    await this._emit(msg, delegator || msg.delegator);
                }
                else if (msg.wiseOp) {
                    await this._emit(msg, delegator || msg.wiseOp.delegator);
                }
                else await this._emit(msg, delegator);
            }
            catch (error) {
                Log.log().exception(Log.level.error, error);
                console.error(error);
            }
        })();
    }

    private async _emit(msg: LogMessage, delegator?: string) {
        const sTime = Date.now();
        if (delegator && !msg.delegator) msg.delegator = delegator;
        const msgStr = JSON.stringify(msg);

        if (delegator) {
            const key = common.redis.daemonLogFor + ":" + delegator;
            // Log.log().debug("Push to " + key);
            await this.redis.lpush(key, msgStr);
            await this.redis.ltrim(key, 0, common.daemonLog.maxHistoryLength);
        }

        if (msg.wiseOp) {
            const wiseOpStr: string = JSON.stringify(msg.wiseOp);
            await this.redis.lpush(common.redis.wiseOperationsLog, wiseOpStr);
            await this.redis.ltrim(common.redis.wiseOperationsLog, 0, common.daemonLog.maxHistoryLength);
        }

        const key = common.redis.daemonLogGeneral;
        await this.redis.lpush(key, msgStr);
        await this.redis.ltrim(key, 0, common.daemonLog.maxHistoryLength);

        const channel = common.redis.channels.realtimeKey;
        await this.redis.publish(channel, msgStr);

        const ellapsedTime = Date.now() - sTime;
        if (ellapsedTime > 50) {
            Log.log().warn("DaemonLog.emit took " + ellapsedTime + "ms");
        }
    }
}

export interface LogMessage {
    delegator?: string;
    time?: number;
    msg: string;
    error?: string;
    transaction?: {
        trx_id: string;
        block_num: number;
        trx_num: number;
    };
    key?: string;
    wiseOp?: EffectuatedWiseOperation;
    [ x: string ]: any;
}