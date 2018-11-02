import { Redis } from "ioredis";
import { common } from "../common/common";
import { DelegatorManager } from "./DelegatorManager";
import { Daemon } from "./Daemon";
import { ApiHelper } from "./ApiHelper";
import { DynamicGlobalProperties } from "steem";

export class DaemonManager {
    private redis: Redis;
    private delegatorManager: DelegatorManager;
    private apiHelper: ApiHelper;

    public constructor(redis: Redis, delegatorManager: DelegatorManager, apiHelper: ApiHelper) {
        this.redis = redis;
        this.delegatorManager = delegatorManager;
        this.apiHelper = apiHelper;
    }

    public async run() {
        console.log("Determining start block...");
        const startBlock = await this.determineStartBlock();
        console.log("Starting from block " + startBlock);

        const daemon = new Daemon(this.redis, this.delegatorManager, this.apiHelper);
        await daemon.run();
    }

    public async determineStartBlock() {
        const lastProcessedBlockFromRedis = await this.redis.hget(common.redis.daemonStatus.key, common.redis.daemonStatus.props.last_processed_block);

        if (lastProcessedBlockFromRedis) return parseInt(lastProcessedBlockFromRedis + "", 10);

        const startBlockFromEnv = process.env.START_FROM_BLOCK;
        if (!startBlockFromEnv) throw new Error("Env START_FROM_BLOCK is missing");

        if (startBlockFromEnv.toLocaleLowerCase() === "head") {
            const dgp: DynamicGlobalProperties = await this.apiHelper.getSteem().getDynamicGlobalPropertiesAsync();
            return parseInt(dgp.head_block_number + "", 10);
        }
        else {
            return parseInt(startBlockFromEnv, 10);
        }
    }
}