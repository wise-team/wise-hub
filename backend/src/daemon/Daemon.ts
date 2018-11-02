import { Redis } from "ioredis";
import { common } from "../common/common";
import Wise, { UniversalSynchronizer, Api } from "steem-wise-core";

export class Daemon {
    private api: Api;
    private redis: Redis;
    // private synchronizer: UniversalSynchronizer;

    public constructor(redis: Redis, api: Api) {
        this.redis = redis;
        this.api = api;
        // this.synchronizer = new UniversalSynchronizer(api, Wise.constructDefaultProtocol(), {
        //
        // });
    }

    public async run() {
        const status = common.redis.daemonStatus;
        await this.redis.hset(status.key, status.props.daemon_start_time_iso, new Date().toISOString());
    }
}