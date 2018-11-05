import { Redis } from "ioredis";
import { common } from "../common/common";
import { DelegatorManager } from "../lib/DelegatorManager";
import { Daemon } from "./Daemon";
import { ApiHelper } from "./ApiHelper";
import { DynamicGlobalProperties } from "steem";
import { Log } from "../lib/Log";
import { RulesManager } from "./rules/RulesManager";
import { RulesLoadedUpToBlock } from "./rules/RulesLoadedUpToBlock";
import { EffectuatedWiseOperation, SetRules, EffectuatedSetRules, RulePrototyper, Api } from "steem-wise-core";
import { DaemonLog } from "./DaemonLog";

export class DaemonManager {
    private redis: Redis;
    private delegatorManager: DelegatorManager;
    private apiHelper: ApiHelper;
    private daemon: Daemon;
    private api: Api;
    private rulesManager: RulesManager;
    private daemonLog: DaemonLog;

    public constructor(redis: Redis, delegatorManager: DelegatorManager, apiHelper: ApiHelper, daemonLog: DaemonLog) {
        this.redis = redis;
        this.delegatorManager = delegatorManager;
        this.apiHelper = apiHelper;
        this.daemonLog = daemonLog;

        this.api = this.apiHelper.constructApiForDaemon();
        this.rulesManager = new RulesManager(this.redis);
        this.daemon = new Daemon(this.redis, this.delegatorManager, this.apiHelper, this.api, this.rulesManager, this.daemonLog);
    }

    public async run() {
        const rulesLoadedUpToBlock = await RulesLoadedUpToBlock.get(this.redis);
        let startBlock = await this.determineStartBlock();
        Log.log().info("DaemonManager.run starting synchronization from block " + startBlock);
        this.daemonLog.emit({ msg: "DaemonManager.run starting synchronization from block " + startBlock });

        if (rulesLoadedUpToBlock < startBlock) {
            const sqlLastBlock = await this.apiHelper.getWiseSQLBlockNumber();
            if (sqlLastBlock < startBlock) startBlock = sqlLastBlock;

            this.daemonLog.emit({ msg: "Preloading rulesets from wiseSQL" });

            const setRulesArr = await this.preloadAllRulesets(startBlock);
            for (let i = 0; i < setRulesArr.length; i++) {
                const setRules = setRulesArr[i];
                await this.rulesManager.saveRules(setRules.delegator, setRules.voter, setRules);
            }
            await RulesLoadedUpToBlock.set(this.redis, startBlock);
            this.daemonLog.emit({ msg: "Rulesets preloading done" });
            Log.log().info("DaemonManager.run rules preloading done ");
        }

        await this.daemon.run(startBlock);
    }

    public async stop() {
        await this.daemon.stop();
    }

    private async determineStartBlock() {
        const startBlockFromEnv = process.env.START_FROM_BLOCK;
        if (!startBlockFromEnv) throw new Error("Env START_FROM_BLOCK is missing");

        if (startBlockFromEnv.toLocaleLowerCase() === "head_reset") {
            Log.log().warn("DaemonManager SKIPPING BLOCKS (mode=HEAD_RESET)");
            const dgp: DynamicGlobalProperties = await this.apiHelper.getSteem().getDynamicGlobalPropertiesAsync();
            return parseInt(dgp.head_block_number + "", 10);
        }

        const lastProcessedBlockFromRedis = await this.redis.hget(common.redis.daemonStatus.key, common.redis.daemonStatus.props.last_processed_block);
        if (lastProcessedBlockFromRedis) return parseInt(lastProcessedBlockFromRedis + "", 10);

        if (startBlockFromEnv.toLocaleLowerCase() === "head") {
            const dgp: DynamicGlobalProperties = await this.apiHelper.getSteem().getDynamicGlobalPropertiesAsync();
            return parseInt(dgp.head_block_number + "", 10);
        }
        else {
            return parseInt(startBlockFromEnv, 10);
        }
    }

    private async preloadAllRulesets(moment: number): Promise<EffectuatedSetRules []> {
        const ops: EffectuatedWiseOperation []
            = await this.apiHelper.getWiseSQL("/rpc/all_rulesets", { moment: moment }, 99999999);
        return ops.map((op: EffectuatedWiseOperation) => {
            const setRules = op.command;
            if (!SetRules.isSetRules(setRules)) throw new Error("Operation is not an instance of SetRules: " + JSON.stringify(op));

            const prototypedRulesets = setRules.rulesets.map(unprototypedRuleset => RulePrototyper.prototypeRuleset(unprototypedRuleset));

            const out: EffectuatedSetRules = {
                moment: op.moment,
                voter: op.voter,
                delegator: op.delegator,
                rulesets: prototypedRulesets
            };
            return out;
        });
    }
}