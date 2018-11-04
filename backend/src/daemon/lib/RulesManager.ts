import * as BluebirdPromise from "bluebird";
import { Redis } from "ioredis";
import { ApiHelper } from "../ApiHelper";
import { common } from "../../common/common";
import { Api, EffectuatedSetRules, SteemOperationNumber } from "steem-wise-core";
import { StaticConfig } from "../StaticConfig";
import { Log } from "../../lib/Log";


export class RulesManager {
    private redis: Redis;
    private api: Api;

    public constructor(redis: Redis, api: Api) {
        this.redis = redis;
        this.api = api;
    }

    public async loadAllRules(delegator: string, moment: SteemOperationNumber) {
        await this.redis.set(common.redis.rules + ":" + delegator + ":@loading", "yes");
        console.log("Loading rulesets for " + delegator + "...");
        const allRules: EffectuatedSetRules [] = await this.api.loadRulesets({ delegator: delegator }, moment);
        for (let i = 0; i < allRules.length; i++) {
            const esr = allRules[i];
            await this.saveRules(esr.delegator, esr.voter, esr);
        }
        await this.redis.set(common.redis.rules + ":" + delegator + ":@ready", "yes");
        await this.redis.set(common.redis.rules + ":" + delegator + ":@loading", "no");
    }

    public async getRules(delegator: string, voter: string, moment: SteemOperationNumber): Promise<EffectuatedSetRules> {
        while (true) {
            const ready = await this.redis.get(common.redis.rules + ":" + delegator + ":@ready");
            if (ready === "yes") break;
            else {
                const loading = await this.redis.get(common.redis.rules + ":" + delegator + ":@loading");
                if (loading) {
                    Log.log().warn("Delegator " + delegator + " is not ready. Waiting 1000ms...");
                    await BluebirdPromise.delay(1000);
                }
                else {
                    await this.loadAllRules(delegator, moment);
                }
            }
        }

        const redisKey = common.redis.rules + ":" + delegator + ":" + voter;
        const rulesFromRedis: [string, string] [] = await this.redis.hgetall(redisKey);
        console.log("rulesJsonFromRedis=" + JSON.stringify(rulesFromRedis, undefined, 2));

        let newest: EffectuatedSetRules = {
            rulesets: [],
            delegator: delegator,
            voter: voter,
            moment: SteemOperationNumber.NEVER
        };

        for (let i = 0; i < rulesFromRedis.length; i++) {
            const blockNum = parseInt(rulesFromRedis[i][0]);
            if (blockNum <= moment.blockNum) {
                if (!newest || blockNum > newest.moment.blockNum) {
                    newest = JSON.parse(rulesFromRedis[i][1]);
                }
            }
        }

        return newest;
    }

    public async saveRules(delegator: string, voter: string, esr: EffectuatedSetRules) {
        const redisKey = common.redis.rules + ":" + delegator + ":" + voter;
        await this.redis.hset(redisKey, esr.moment.blockNum + "", JSON.stringify(esr));
        console.log("save: " + JSON.stringify(esr, undefined, 2));
    }

    public async deleteAllRules(delegator: string) {
        await this.redis.set(common.redis.rules + ":" + delegator + ":@ready", "no");
        await this.redis.set(common.redis.rules + ":" + delegator + ":@loading", "no");
        const startMs = Date.now();
        const pattern = common.redis.rules + ":" + delegator + ":*";
        const keys: string [] = await this.redis.keys(pattern);
        if (keys.length > 0) {
            if (keys.length > 500) Log.log().warn("Deleting " + keys.length + " keys!");
            const removedCount = await this.redis.del(...keys);
            if (removedCount !== keys.length) throw new Error("Not all keys were removed (keys.length=" + keys.length + ",removedCount=" + removedCount);
            const ellapsedMs = Date.now() - startMs;
            if (ellapsedMs > 20) Log.log().warn("Deleting delegator keys from redis took " + ellapsedMs + "ms");
        }
    }
}