import { Redis } from "ioredis";
import { common } from "../common/common";
import * as steemJs from "steem";
import { Log } from "../lib/Log";

export class ToSendQueue {
    private redis: Redis;

    public constructor(redis: Redis) {
        this.redis = redis;
    }

    public async init() {
        let dirtyListElementsPresent = true;
        let dirtyCount = 0;
        while (dirtyListElementsPresent) {
            const resp = await this.redis.rpoplpush(common.redis.publishProcessingQueue, common.redis.toPublishQueue);
            dirtyListElementsPresent = (!!resp);
            if (dirtyListElementsPresent) dirtyCount++;
        }
        Log.log().info("Pushed dirty (ones that were still processed at shutdown) publish operations to queue: " + dirtyCount);
    }

    public async hasIncomingOperations(): Promise<boolean> {
        const llen = await this.redis.llen(common.redis.toPublishQueue);
        return llen > 0;
    }

    public async awaitOpsToPublish(timeoutSeconds: number): Promise<OpsToPublish | undefined> {
        const resp = await this.redis.brpoplpush(common.redis.toPublishQueue, common.redis.publishProcessingQueue, timeoutSeconds);
        if (!resp) return undefined;

        const opsToPublish: OpsToPublish = JSON.parse(resp);
        opsToPublish.redisValue = resp;
        return opsToPublish;
    }

    public async moveOpsBackToQueue(otp: OpsToPublish) {
        await this.removeFromProcessingQueue(otp);
        const elem: OpsToPublish = {
            ops: otp.ops,
            delegator: otp.delegator,
            // skip key, it is only required to ensure proper list remove
        };
        await this.redis.lpush(common.redis.toPublishQueue, JSON.stringify(elem));
    }

    public async removeFromProcessingQueue(otp: OpsToPublish) {
        if (!otp.redisValue) throw new Error("Cannot remove OptToPublish that does not have .redisValue set");
        const numRemoved = await this.redis.lrem(common.redis.publishProcessingQueue, 0, otp.redisValue);
        if (numRemoved === 0) throw new Error("Item " + otp.redisValue + " not found in processing queue");
    }

    public static async addToPublishQueue(redis: Redis, delegator: string, ops: steemJs.OperationWithDescriptor []) {
        const otp: OpsToPublish = {
            ops: ops,
            delegator: delegator
        };
        await redis.lpush(common.redis.toPublishQueue, JSON.stringify(otp));
    }
}

export interface OpsToPublish {
    ops: steemJs.OperationWithDescriptor [];
    delegator: string;
    redisValue?: string;
}
