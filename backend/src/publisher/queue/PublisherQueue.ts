import ow from "ow";
import { CustomError } from "universe-log";

import { ow_catch } from "../../lib/util";
import { PublishJob } from "../entities/PublishJob";

export interface PublisherQueue {
    resetProcessingQueue(): Promise<void>;
    scheduleJob(job: PublishJob): Promise<void>;
    takeJob(timeoutSeconds: number): Promise<Readonly<PublisherQueue.JobEntry> | undefined>;
    finishJob(job: Readonly<PublisherQueue.JobEntry>): Promise<void>;
}

export namespace PublisherQueue {
    export function isPublisherQueue(obj: any): obj is PublisherQueue {
        const o = obj as PublisherQueue;
        return (
            o.resetProcessingQueue !== undefined &&
            o.scheduleJob !== undefined &&
            o.takeJob !== undefined &&
            o.finishJob !== undefined
        );
    }

    export type JobEntry = PublishJob & { redisStringifiedEntry: string };

    export namespace JobEntry {
        export function validate(jobEntry: JobEntry) {
            ow(jobEntry, ow.object.is(o => ow_catch(() => PublishJob.validate(o as JobEntry))).label("JobEntry"));
            ow(
                jobEntry.redisStringifiedEntry,
                ow.string.nonEmpty.startsWith("{").label("JobEntry.redisStringifiedEntry"),
            );
        }
    }

    export class PublisherQueueError extends CustomError {
        public constructor(message?: string, cause?: Error) {
            super(message, cause);
        }
    }
}
