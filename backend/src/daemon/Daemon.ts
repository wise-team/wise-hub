import * as steemJs from "steem";
import { Redis } from "ioredis";
import { common } from "../common/common";
import Wise, { UniversalSynchronizer, Api, SteemOperationNumber, SetRules, EffectuatedWiseOperation, SendVoteorder, EffectuatedSetRules, ConfirmVote, WiseOperation } from "steem-wise-core";
import { DelegatorManager } from "../lib/DelegatorManager";
import { ApiHelper } from "./ApiHelper";
import { Log } from "../lib/Log";
import { RulesManager } from "./lib/RulesManager";
import { ValidationRunner } from "./ValidationRunner";
import { StaticConfig } from "./StaticConfig";
import { ToSendQueue } from "../publisher/ToSendQueue";

export class Daemon {
    private api: Api;
    private redis: Redis;
    private synchronizer: UniversalSynchronizer;
    private delegatorManager: DelegatorManager;
    private rulesManager: RulesManager;
    private validationRunner: ValidationRunner;
    private apiHelper: ApiHelper;

    public constructor(redis: Redis, delegatorManager: DelegatorManager, apiHelper: ApiHelper) {
        this.redis = redis;
        this.apiHelper = apiHelper;
        this.delegatorManager = delegatorManager;

        this.api = this.apiHelper.constructApiForDaemon();

        this.rulesManager = new RulesManager(this.redis, this.api);
        this.delegatorManager.onDelegatorAdd(addedDelegator => {
            this.rulesManager.loadAllRules(addedDelegator, this.synchronizer.getLastProcessedOperation());
        });
        this.delegatorManager.onDelegatorDel(deletedDelegator => {
            this.rulesManager.deleteAllRules(deletedDelegator);
        });

        this.validationRunner = new ValidationRunner(this.redis, this.api);

        this.synchronizer = new UniversalSynchronizer(this.api, Wise.constructDefaultProtocol(), {
            onSetRules: (setRules, wiseOp) => this.onSetRules(setRules, wiseOp),
            onVoteorder: (voteorder, wiseOp) => this.onVoteorder(voteorder, wiseOp),
            onStart: () => this.onStart(),
            onError:  (error: Error, proceeding: boolean) => this.onError(error, proceeding),
            onFinished: () => this.onFinished(),
            onBlockProcessingStart: (blockNum) => this.onBlockProcessingStart(blockNum),
            onBlockProcessingFinished: (blockNum) => this.onBlockProcessingFinished(blockNum)
        });
    }

    public async run(startBlock: number) {
        const status = common.redis.daemonStatus;
        await this.redis.hset(status.key, status.props.daemon_start_time_iso, new Date().toISOString());
        this.synchronizer.start(new SteemOperationNumber(startBlock, 0, 0));
    }

    public stop(): void {
        this.synchronizer.stop();
    }

    private onStart() {
        Log.log().info("Synchronizer started");
    }

    private onFinished() {
        Log.log().info("Synchronizer stop");
    }

    private onBlockProcessingStart(blockNum: number) {
    }

    private onBlockProcessingFinished(blockNum: number) {
        if (blockNum % 30 == 0) Log.log().info("Finished processing block " + blockNum);
        this.redis.hset(common.redis.daemonStatus.key, common.redis.daemonStatus.props.last_processed_block, blockNum + "");
    }

    private onError(error: Error, proceeding: boolean) {
        Log.log().exception(Log.level.error, error);
        if (!proceeding) Log.log().error("This is an irreversible error!");
    }

    private onSetRules(setRules: SetRules, op: EffectuatedWiseOperation) {
        if (this.delegatorManager.hasDelegator(op.delegator)) {
            const es: EffectuatedSetRules = {
                moment: op.moment,
                voter: op.voter,
                delegator: op.delegator,
                rulesets: setRules.rulesets
            };
            this.safeAsyncCall(() => this.rulesManager.saveRules(op.delegator, op.voter, es));
        }
    }

    private onVoteorder(cmd: SendVoteorder, op: EffectuatedWiseOperation, errorTimeout: number = StaticConfig.DAEMON_ON_VOTEORDER_ERROR_REPEAT_AFTER_S) {
        if (this.delegatorManager.hasDelegator(op.delegator)) {
            this.safeAsyncCall(async () => {
                try {
                    const esr: EffectuatedSetRules = await this.rulesManager.getRules(op.delegator, op.voter, op.moment);
                    const verdict: ValidationRunner.Verdict = await this.validationRunner.validate(cmd, op, esr);
                    this.voteorderCommit(cmd, op, verdict);
                }
                catch (error) {
                    const timeout = errorTimeout  * ( Math.random() - 0.5 );
                    setTimeout(() => this.onVoteorder(cmd, op, Math.max(errorTimeout * StaticConfig.DAEMON_ON_VOTEORDER_ERROR_MULTI, 3600 * 3)), timeout);
                }
            });
        }
    }

    private async voteorderCommit(cmd: SendVoteorder, op: EffectuatedWiseOperation, verdict: ValidationRunner.Verdict) {
        if (verdict.pass) {
            Log.log().cheapDebug(() => "PASS VOTEORDER: " + JSON.stringify(op, undefined, 2));
        }
        else {
            Log.log().cheapDebug(() => "REJECT VOTEORDER(msg=" + verdict.msg + "): " + JSON.stringify(op, undefined, 2));
        }

        const opsToSend: steemJs.OperationWithDescriptor[] = [];
        try {
            const confirmCmd: ConfirmVote = {
                voteorderTxId: op.transaction_id,
                accepted: verdict.pass,
                msg: verdict.msg,
            };
            const wiseOp: WiseOperation = {
                voter: op.voter,
                delegator: op.delegator,
                command: confirmCmd
            };
            opsToSend.push(...this.apiHelper.getWiseProtocol().serializeToBlockchain(wiseOp));

            if (verdict.pass) {
                const voteOp: steemJs.VoteOperation = {
                    voter: op.delegator,
                    author: cmd.author,
                    permlink: cmd.permlink,
                    weight: cmd.weight
                };
                opsToSend.push(["vote", voteOp]);
            }
            this.safeAsyncCall(async () => await this.sendOps(op.delegator, opsToSend));
        }
        catch (error) {
            Log.log().exception(Log.level.error, error);
        }
    }

    private async sendOps(delegator: string, ops: steemJs.OperationWithDescriptor []) {
        ToSendQueue.addToPublishQueue(this.redis, delegator, ops);
    }

    private safeAsyncCall(fn: () => any) {
        if (!fn) return;
        (async () => {
            try {
                await fn();
            }
            catch (error) {
                Log.log().error("Unhandled error in UniversalSynchronizer callback: " + error);
                Log.log().exception(Log.level.error, error);
            }
        })();
    }
}