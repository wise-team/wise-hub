import ow, { ObjectPredicate } from "ow";

import { PublisherQueue } from "./PublisherQueue";
import { RedisDualQueue } from "./RedisDualQueue";
import { PublishJob } from "../entities/PublishJob";

export class PublisherQueueImpl implements PublisherQueue {
    private redisDualQueue: RedisDualQueue;

    public constructor(redisDualQueue: RedisDualQueue) {
        ow(redisDualQueue, ow.object.is(o => RedisDualQueue.isRedisDualQueue(o)).label("redisDualQueue"));

        this.redisDualQueue = redisDualQueue;
    }

    public async resetProcessingQueue(): Promise<void> {
        try {
            await this.redisDualQueue.pushAllFromProcessingQueueToWaitingQueue();
        } catch (error) {
            throw new PublisherQueue.PublisherQueueError(
                "Error in PublisherQueueImpl.resetProcessingQueue(): " + error,
                error
            );
        }
    }

    public async scheduleJob(job: PublishJob): Promise<void> {
        PublishJob.validate(job);

        try {
            const jobStr = JSON.stringify(job);
            await this.redisDualQueue.pushToWaitingQueue(jobStr);
        } catch (error) {
            throw new PublisherQueue.PublisherQueueError("Error in PublisherQueueImpl.scheduleJob(): " + error, error);
        }
    }

    public async takeJob(timeoutSeconds: number): Promise<Readonly<PublisherQueue.JobEntry> | undefined> {
        ow(timeoutSeconds, ow.number.greaterThan(0).label("timeoutSeconds"));

        try {
            const returnedJobStr = await this.redisDualQueue.popFromWaitingQueuePushToProcessingQueue(timeoutSeconds);
            if (!returnedJobStr) return undefined;

            const returnedJob: PublishJob = JSON.parse(returnedJobStr);
            PublishJob.validate(returnedJob);

            const jobEntry: PublisherQueue.JobEntry = { ...returnedJob, redisStringifiedEntry: returnedJobStr };
            PublisherQueue.JobEntry.validate(jobEntry);

            return Object.freeze(jobEntry);
        } catch (error) {
            throw new PublisherQueue.PublisherQueueError("Error in PublisherQueueImpl.takeJob(): " + error, error);
        }
    }

    public async finishJob(jobEntry: Readonly<PublisherQueue.JobEntry>): Promise<void> {
        PublisherQueue.JobEntry.validate(jobEntry);

        try {
            const jobStr = jobEntry.redisStringifiedEntry;
            await this.redisDualQueue.removeFromProcessingQueue(jobStr);
        } catch (error) {
            throw new PublisherQueue.PublisherQueueError("Error in PublisherQueueImpl.finishJob(): " + error, error);
        }
    }
}
