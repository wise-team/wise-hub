import ow from "ow";
import { ow_catch } from "../../lib/util";
import { PublishableOperation } from "./PublishableOperation";

export interface PublishJob {
    ops: PublishableOperation[];
    delegator: string;
}

export namespace PublishJob {
    export function validate(job: PublishJob) {
        ow(
            job.ops,
            ow.array
                .label("job.ops")
                .ofType(ow.array.is(o => ow_catch(() => PublishableOperation.validatePublishableOperation(o as any))))
        );
        ow(job.delegator, ow.string.minLength(3).label("job.delegator"));
    }

    export function toString(job: PublishJob): string {
        const commaDelimitedOps = job.ops.map(op => op[0]).join(", ");
        return `[@${job.delegator}: ${commaDelimitedOps}]`;
    }
}
