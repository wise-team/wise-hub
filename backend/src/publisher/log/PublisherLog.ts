import ow from "ow";

import { LogMessage as DaemonLogMessage } from "../../daemon/DaemonLog";
import { Broadcaster } from "../broadcaster/Broadcaster";
import { PublishJob } from "../entities/PublishJob";

export interface PublisherLog {
    logJobStart(job: PublishJob): Promise<void>;
    logJobSuccess(job: PublishJob, result: Broadcaster.Result): Promise<void>;
    logBroadcasterWarning(job: PublishJob, msg: string): Promise<void>;
    logJobFailure(job: PublishJob, error: Error): Promise<void>;
}

export namespace PublisherLog {
    export type Message = DaemonLogMessage;

    export interface Params {
        log: (msg: Message) => Promise<void>; //
        fallbackLog: (msg: string, error?: Error) => void;
    }

    export namespace Params {
        export function validate(params: Params) {
            ow(params.log, ow.function.label("params.log"));
            ow(params.fallbackLog, ow.object.label("params.fallbackLog"));
        }
    }
}
