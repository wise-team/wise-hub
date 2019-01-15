import ow from "ow";

import { PublisherLog } from "./PublisherLog";
import { PublishJob } from "../entities/PublishJob";
import { Broadcaster } from "../broadcaster/Broadcaster";
import { PublishableOperation } from "../entities/PublishableOperation";
import { VoteOperation } from "steem";

export class PublisherLogImpl implements PublisherLog {
    private params: PublisherLog.Params;

    public constructor(params: PublisherLog.Params) {
        PublisherLog.Params.validate(params);

        this.params = params;
    }

    public async logJobStart(job: PublishJob): Promise<void> {
        ow(job, ow.object.label("job"));

        try {
            await this.log({
                ...this.getCommonMessageForJob(job),
                msg:
                    `Broadcasting @${job.delegator}'s operations ` +
                    `(${this.getOpsDesc(job.ops)}) to blockchain via SteemConnect`,
            });
        } catch (error) {
            this.fallbackLog("Error in PublisherLog.logJobStart", error);
        }
    }

    public async logJobSuccess(job: PublishJob, result: Broadcaster.Result): Promise<void> {
        ow(job, ow.object.label("job"));

        try {
            await this.log({
                ...this.getCommonMessageForJob(job),
                msg:
                    `Successfully broadcasted @${job.delegator}'s operations ` +
                    `(${this.getOpsDesc(job.ops)}) blockchain: ` +
                    `[b: ${result.block_num}, t: ${result.transaction_num}, trxId: ${result.transaction_id}]`,
                transaction: {
                    trx_id: result.transaction_id,
                    block_num: result.block_num,
                    trx_num: result.transaction_num,
                },
            });
        } catch (error) {
            this.fallbackLog("Error in PublisherLog.logJobStart", error);
        }
    }
    public async logJobFailure(job: PublishJob, error: Error): Promise<void> {
        ow(job, ow.object.label("job"));

        try {
            await this.log({
                ...this.getCommonMessageForJob(job),
                msg:
                    `Failed to broadcast @${job.delegator}'s operations ` +
                    `(${this.getOpsDesc(job.ops)}) to blockchain: ${error}`,
                error: error + "",
            });
        } catch (error) {
            this.fallbackLog("Error in PublisherLog.logJobStart", error);
        }
    }

    private getOpsDesc(ops: PublishableOperation[]) {
        return (
            "[" +
            ops
                .map(op => {
                    if (op[0] === "vote") {
                        const voteOp = op[1] as VoteOperation;
                        return `vote (${voteOp.author}/${voteOp.permlink}, ${voteOp.weight})`;
                    } else return "custom_json";
                })
                .join(", ") +
            "]"
        );
    }

    private getCommonMessageForJob(job: PublishJob) {
        return { delegator: job.delegator, time: Date.now() };
    }

    private async log(msg: PublisherLog.Message) {
        try {
            this.fallbackLog(JSON.stringify({ service: "publisher/PublisherLog", ...msg }));
            await this.params.log(msg);
        } catch (error) {
            this.fallbackLog("PublisherLog could not send message to log", error);
        }
    }

    private fallbackLog(msg: string, error?: Error) {
        try {
            this.params.fallbackLog(msg, error);
        } catch (error) {
            console.error("Error in PublisherLogImpl.fallbackLog", error);
        }
    }
}
