import { Broadcaster } from "./Broadcaster";
import { UsersManager } from "../../lib/UsersManager";
import { PublishJob } from "../entities/PublishJob";
import { Steemconnect } from "../../lib/Steemconnect";
import * as BluebirdPromise from "bluebird";

export class BroadcasterImpl implements Broadcaster {
    private params: Broadcaster.Params;

    public constructor(params: Broadcaster.Params) {
        Broadcaster.Params.validate(params);

        this.params = params;
    }

    public async broadcast(job: PublishJob): Promise<Broadcaster.Result> {
        PublishJob.validate(job);

        const result = await this.doBroadcast(job, 0);

        if (!Steemconnect.BroadcastResult.isBroadcastResult(result)) {
            throw new Broadcaster.BroadcastError(
                "Bad response from steemconnect: " + JSON.stringify(result).substring(0, 400)
            );
        }

        return {
            transaction_id: result.id,
            block_num: result.block_num,
            transaction_num: result.trx_num,
        };
    }

    private async doBroadcast(job: PublishJob, tryNum: number): Promise<Steemconnect.BroadcastResult> {
        try {
            return await this.params.usersManager.broadcast(job.delegator, this.params.broadcastScope, job.ops);
        } catch (error) {
            if (error.name === "SDKError" && (error as any).error === "server_error") {
                throw new Broadcaster.BroadcastError(
                    "Steemconnect error: " + (error as any).error_description || "bad error response from steemconnect",
                    error
                );
            } else {
                const retryDelayMs = this.getRetryDelayMs(tryNum);
                if (!retryDelayMs) throw error;
                else {
                    this.log("Failed to publish job, retrying after " + retryDelayMs + "ms. Error: ", error);
                    await BluebirdPromise.delay(retryDelayMs);
                    return await this.doBroadcast(job, tryNum + 1);
                }
            }
        }
    }

    private getRetryDelayMs(tryNum: number): number | undefined {
        return tryNum < this.params.retryDelaysSeconds.length
            ? this.params.retryDelaysSeconds[tryNum] * 1000
            : undefined;
    }

    private log(msg: string, error?: Error) {
        try {
            this.params.log(msg, error);
        } catch (error) {
            console.error("Error in BroadcasterImpl.log", error);
        }
    }
}
