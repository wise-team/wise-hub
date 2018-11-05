import { Redis } from "ioredis";
import { common } from "../../common/common";

export class RulesLoadedUpToBlock {
    public static async get(redis: Redis): Promise<number> {
        const strV = await redis.get(common.redis.rulesLoadedUpToBlock);
        if (!strV) return 0;
        else return parseInt(strV, 10);
    }

    public static async set(redis: Redis, blockNum: number) {
        await redis.set(common.redis.rulesLoadedUpToBlock, blockNum + "");
    }
}