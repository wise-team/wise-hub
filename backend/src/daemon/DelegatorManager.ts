import * as Redis from "ioredis";
import * as _ from "lodash";
import { common } from "../common/common";

export class DelegatorManager {
    private redis: Redis.Redis;
    private delegators: string [] = [];
    private onDelegatorAddListeners: ((delegator: string) => any) [] = [];
    private onDelegatorDelListeners: ((delegator: string) => any) [] = [];

    public constructor(redis: Redis.Redis) {
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

    public onDelegatorAdd(listener: (delegator: string) => any) {
        this.onDelegatorAddListeners.push(listener);
    }

    public onDelegatorDel(listener: (delegator: string) => any) {
        this.onDelegatorDelListeners.push(listener);
    }

    public async reloadDelegators() {
        const newDelegatorList = await this.redis.smembers(common.redis.delegators);

        const deleted = _.difference(this.delegators, newDelegatorList);
        const added = _.difference(newDelegatorList, this.delegators);
        this.delegators = newDelegatorList;

        deleted.forEach(delegator => {
            console.log("Delete delegator " + delegator);
            this.onDelegatorDelListeners.forEach(listener => listener(delegator));
        });

        added.forEach(delegator => {
            console.log("Add delegator " + delegator);
            this.onDelegatorAddListeners.forEach(listener => listener(delegator));
        });

        console.log("Delegators: " + JSON.stringify(this.delegators, undefined, 2));

        setTimeout(() => { this.reloadDelegators(); }, 1000 * 3600 * 1);
    }

    public hasDelegator(account: string): boolean {
        return this.delegators.indexOf(account) !== -1;
    }
}