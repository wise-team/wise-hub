import { Redis } from "ioredis";
import { common } from "../common/common";
import { DelegatorManager } from "../lib/DelegatorManager";
import { Daemon } from "./Daemon";
import { ApiHelper } from "./ApiHelper";
import { DynamicGlobalProperties } from "steem";
import { Log } from "../lib/Log";

export class DaemonManager {
    private redis: Redis;
    private delegatorManager: DelegatorManager;
    private apiHelper: ApiHelper;
    private daemon: Daemon;

    public constructor(redis: Redis, delegatorManager: DelegatorManager, apiHelper: ApiHelper) {
        this.redis = redis;
        this.delegatorManager = delegatorManager;
        this.apiHelper = apiHelper;

        this.daemon = new Daemon(this.redis, this.delegatorManager, this.apiHelper);
    }

    public async run() {
        const startBlock = await this.determineStartBlock();
        Log.log().info("DaemonManager.run starting synchronization from block " + startBlock);

        await this.daemon.run(startBlock);
    }

    public async stop() {
        await this.daemon.stop();
    }

    public async determineStartBlock() {
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
}