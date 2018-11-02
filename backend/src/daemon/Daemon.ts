import { Redis } from "ioredis";
import { common } from "../common/common";
import Wise, { UniversalSynchronizer, Api } from "steem-wise-core";
import { DelegatorManager } from "./DelegatorManager";
import { ApiHelper } from "./ApiHelper";

export class Daemon {
    private redis: Redis;
    // private synchronizer: UniversalSynchronizer;
    private delegatorManager: DelegatorManager;
    private apiHelper: ApiHelper;

    public constructor(redis: Redis, delegatorManager: DelegatorManager, apiHelper: ApiHelper) {
        this.redis = redis;
        this.apiHelper = apiHelper;
        this.delegatorManager = delegatorManager;
        /*this.synchronizer = new UniversalSynchronizer(api, Wise.constructDefaultProtocol(), {
        });*/
    }

    public async run() {
        const status = common.redis.daemonStatus;
        await this.redis.hset(status.key, status.props.daemon_start_time_iso, new Date().toISOString());
    }
}