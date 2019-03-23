import ow from "ow";
import { CustomError } from "universe-log";

import { UsersManagerI } from "../../lib/UsersManagerI";
import { PublishJob } from "../entities/PublishJob";

export interface Broadcaster {
    broadcast(job: PublishJob): Promise<Broadcaster.Result>;
}

export namespace Broadcaster {
    export interface Params {
        onWarning: (job: PublishJob, msg: string, error?: Error) => void;
        usersManager: UsersManagerI;
        retryDelaysSeconds: number[];
        broadcastScope: string[];
    }

    export namespace Params {
        export function validate(params: Params) {
            ow(params.onWarning, ow.function.label("params.onWarning"));
            ow(params.usersManager, ow.object.label("params.usersManager"));
            ow(params.retryDelaysSeconds, ow.array.ofType(ow.number.greaterThan(0)).label("params.retryDelaysSeconds"));
            ow(params.broadcastScope, ow.array.ofType(ow.string.nonEmpty).label("params.broadcastScope"));
        }
    }

    export interface Result {
        transaction_id: string;
        block_num: number;
        transaction_num: number;
    }

    export namespace Result {
        export function validate(o: Result) {
            ow(o.transaction_id, ow.string.nonEmpty.label("Broadcaster.Result.transaction_id"));
            ow(o.block_num, ow.number.greaterThan(0).label("Broadcaster.Result.block_num"));
            ow(o.transaction_num, ow.number.greaterThanOrEqual(0).label("Broadcaster.Result.transaction_num"));
        }
    }

    export class BroadcastError extends CustomError {
        public constructor(message?: string, cause?: Error) {
            super(message, cause);
        }
    }
}
