import * as steemJs from "steem";
import ow from "ow";

import { RedisDualQueue } from "./RedisDualQueue";
import { Redis } from "../../lib/redis/Redis";

export class RedisDualQueueImpl implements RedisDualQueue {
    private redis: Redis;
    private options: RedisDualQueueImpl.Options;

    public constructor(redis: Redis, options: RedisDualQueueImpl.Options) {
        ow(redis, ow.object.label("redis"));
        ow(options, ow.object.label("options"));
        ow(options.waitingQueueKey, ow.string.nonEmpty.label("options.waitingQueueKey"));
        ow(options.processingQueueKey, ow.string.nonEmpty.label("options.processingQueueKey"));

        this.redis = redis;
        this.options = options;
    }

    public async isWaitingQueueEmpty(): Promise<boolean> {
        try {
            const llen = await this.redis.llen(this.options.waitingQueueKey);
            return llen === 0;
        } catch (error) {
            throw new RedisDualQueue.RedisDualQueueError("Error in RedisDualQueueImpl.isWaitingQueueEmpty", error);
        }
    }

    public async isProcessingQueueEmpty(): Promise<boolean> {
        try {
            const llen = await this.redis.llen(this.options.waitingQueueKey);
            return llen === 0;
        } catch (error) {
            throw new RedisDualQueue.RedisDualQueueError("Error in RedisDualQueueImpl.isProcessingQueueEmpty", error);
        }
    }

    public async pushToWaitingQueue(entry: string): Promise<void> {
        ow(entry, ow.string.nonEmpty.label("entry"));

        try {
            await this.redis.lpush(this.options.waitingQueueKey, JSON.stringify(entry));
        } catch (error) {
            throw new RedisDualQueue.RedisDualQueueError("Error in RedisDualQueueImpl.pushToWaitingQueue", error);
        }
    }

    public async popFromWaitingQueuePushToProcessingQueue(timeoutSeconds: number): Promise<string | undefined> {
        ow(timeoutSeconds, ow.number.greaterThan(0).label("timeoutSeconds"));

        try {
            const resp = await this.redis.brpoplpush(
                this.options.waitingQueueKey,
                this.options.processingQueueKey,
                timeoutSeconds
            );
            if (!resp) return undefined;
            else {
                return resp;
            }
        } catch (error) {
            throw new RedisDualQueue.RedisDualQueueError(
                "Error in RedisDualQueueImpl.popFromWaitingQueuePushToProcessingQueue",
                error
            );
        }
    }

    public async removeFromProcessingQueue(entry: string): Promise<void> {
        ow(entry, ow.string.nonEmpty.label("entry"));

        try {
            const numRemoved = await this.redis.lrem(this.options.processingQueueKey, entry);
            if (numRemoved === 0)
                throw new RedisDualQueue.RedisDualQueueError("Item " + entry + " not found in processing queue");
        } catch (error) {
            if (error instanceof RedisDualQueue.RedisDualQueueError) throw error;
            else
                throw new RedisDualQueue.RedisDualQueueError(
                    "Error in RedisDualQueueImpl.removeFromProcessingQueue",
                    error
                );
        }
    }

    public async removeFromProcessingQueueAndPushBackToWaitingQueue(entry: string): Promise<void> {
        ow(entry, ow.string.nonEmpty.label("entry"));

        try {
            await this.removeFromProcessingQueue(entry);
            await this.pushToWaitingQueue(entry);
        } catch (error) {
            if (error instanceof RedisDualQueue.RedisDualQueueError) throw error;
            else
                throw new RedisDualQueue.RedisDualQueueError(
                    "Error in RedisDualQueueImpl.removeFromProcessingQueueAndPushBackToWaitingQueue",
                    error
                );
        }
    }
}

export namespace RedisDualQueueImpl {
    export interface Options {
        waitingQueueKey: string;
        processingQueueKey: string;
    }
}
