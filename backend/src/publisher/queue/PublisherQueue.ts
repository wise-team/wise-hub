import ow from "ow";
import { ow_catch } from "../../lib/util";

import { RedisDualQueue } from "./RedisDualQueue";
import { PublishJob } from "../entities/PublishJob";
import { CustomError } from "../../lib/CustomError";

export interface PublisherQueue {
    resetProcessingQueue(): Promise<void>;
    scheduleJob(job: PublishJob): Promise<void>;
    takeJob(timeoutSeconds: number): Promise<Readonly<PublisherQueue.JobEntry> | undefined>;
    finishJob(job: Readonly<PublisherQueue.JobEntry>): Promise<void>;
}

export namespace PublisherQueue {
    export type JobEntry = PublishJob & { redisStringifiedEntry: string };

    export namespace JobEntry {
        export function validate(jobEntry: JobEntry) {
            ow(jobEntry, ow.object.is(o => ow_catch(() => PublishJob.validate(o as JobEntry))).label("JobEntry"));
            ow(
                jobEntry.redisStringifiedEntry,
                ow.string.nonEmpty.startsWith("{").label("JobEntry.redisStringifiedEntry")
            );
        }
    }

    export class PublisherQueueError extends CustomError {
        public constructor(message?: string, cause?: Error) {
            super(message, cause);
        }
    }
}
