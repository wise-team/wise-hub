import { Redis } from "ioredis";
import { ApiHelper } from "../ApiHelper";
import { common } from "../../common/common";
import { Api, EffectuatedSetRules, SteemOperationNumber } from "steem-wise-core";
import { StaticConfig } from "../StaticConfig";


export class RulesManager {
    private redis: Redis;
    private api: Api;

    public constructor(redis: Redis, api: Api) {
        this.redis = redis;
        this.api = api;
    }

    public async getRules(delegator: string, voter: string, moment: SteemOperationNumber): Promise<EffectuatedSetRules> {
        const redisKey = common.redis.rules + ":" + delegator + ":" + voter;
        const rulesJsonFromRedis = await this.redis.get(redisKey);
        if (rulesJsonFromRedis) {
            console.log("Loaded rules from " + redisKey);
            return JSON.parse(rulesJsonFromRedis);
        }
        else {
            let esr: EffectuatedSetRules = {
                rulesets: [],
                delegator: delegator,
                voter: voter,
                moment: SteemOperationNumber.NEVER
            };
            const esrArray: EffectuatedSetRules [] = await this.api.loadRulesets({ delegator: delegator, voter: voter }, moment);
            if (esrArray.length === 1) {
                esr = esrArray[0];
            }
            else if (esrArray.length > 1) throw new Error("Too much rulesets returned from the api");

            console.log("Loaded rules from api, saving to " + redisKey);
            this.redis.set(redisKey, JSON.stringify(esr), "EX", StaticConfig.RULES_IN_REDIS_TTL);
            return esr;
        }
    }

    public async saveRules(delegator: string, voter: string, esr: EffectuatedSetRules) {
        const redisKey = common.redis.rules + ":" + delegator + ":" + voter;
        this.redis.set(redisKey, JSON.stringify(esr), "EX", StaticConfig.RULES_IN_REDIS_TTL);
    }

    public async clearForDelegator(delegator: string) {
        console.log("Running costly command clearForDelegator(" + delegator + ")");
        const pattern = common.redis.rules + ":" + delegator + ":*";
        const keys = await this.redis.keys(pattern);
        const removedCount = await this.redis.del(...keys);
        console.log("Deleted " + removedCount + " items in clearForDelegator(" + delegator + ")");
    }
}