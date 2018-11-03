import * as BluebirdPromise from "bluebird";
import { Redis } from "ioredis";
import { Vault } from "../lib/vault/Vault";
import { OpsToPublish, ToSendQueue } from "./ToSendQueue";
import { common } from "../common/common";
import { Log } from "../lib/Log";
import { StaticConfig } from "./StaticConfig";

export class Publisher {
    private redis: Redis;
    private vault: Vault;
    private queue: ToSendQueue;

    public constructor(redis: Redis, vault: Vault) {
        this.redis = redis;
        this.vault = vault;

        this.queue = new ToSendQueue(this.redis);
    }

    public async run() {
        let i = 0;
        while (true) {
            try {
                this.redis.set(common.redis.publisherHartbeat, "ALIVE", "EX", 40);
                const otp: OpsToPublish | undefined = await this.queue.awaitOpsToPublish(20);
                if (otp) {
                    this.publish(otp);
                    Log.log().info("Throttling. Waiting " + StaticConfig.PUBLISH_THROTTLING_MS + "ms before publishing next ops");
                    await BluebirdPromise.delay(StaticConfig.PUBLISH_THROTTLING_MS);
                }
                else {
                    if (i % 10 == 0) console.log("No ops to publish at " + (new Date().toISOString()));
                }
            }
            catch (error) {
                Log.log().exception(Log.level.error, error);
                await BluebirdPromise.delay(200);
            }
            i++;
        }
    }

    public async publish(otp: OpsToPublish) {
        // TODO
        Log.log().info("Publisher => publish ops " + JSON.stringify(otp));
    }
}