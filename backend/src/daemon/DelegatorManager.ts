import { Vault } from "../lib/vault/Vault";
import * as Redis from "ioredis";
import { common } from "../common/common";

export class DelegatorManager {
    private vault: Vault;
    private redis: Redis.Redis;
    private delegators: string [] = [];

    public constructor(vault: Vault, redis: Redis.Redis) {
        this.vault = vault;
        this.redis = redis;
    }

    public async init(redisUrl: string) {
        await this.reloadDelegators();

        const subscriberRedis = new Redis(redisUrl);
        const channelKey = common.redis.channels.delegators.key;
        await subscriberRedis.subscribe(channelKey).then(() => {});
        subscriberRedis.on("message", (channel, message) => {
            if (channel === channelKey && message === common.redis.channels.delegators.list_changed) {
                console.log("Got list changed message, updating delegator list");
                this.reloadDelegators();
            }
        });
    }

    public async reloadDelegators() {
        this.delegators = await this.redis.smembers(common.redis.delegators);
        console.log("Delegators: " + JSON.stringify(this.delegators, undefined, 2));

        setTimeout(() => { this.reloadDelegators(); }, 1000 * 3600 * 1);
    }
}