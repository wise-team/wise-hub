import ow from "ow";

import { PublishJob } from "../entities/PublishJob";
import { Broadcaster } from "../broadcaster/Broadcaster";
import { LogMessage as DaemonLogMessage } from "../../daemon/DaemonLog";

export interface PublisherLog {
    logJobStart(job: PublishJob): Promise<void>;
    logJobSuccess(job: PublishJob, result: Broadcaster.Result): Promise<void>;
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
