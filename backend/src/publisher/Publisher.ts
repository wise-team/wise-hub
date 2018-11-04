import * as BluebirdPromise from "bluebird";
import { Redis } from "ioredis";
import { Vault } from "../lib/vault/Vault";
import { OpsToPublish, ToSendQueue } from "./ToSendQueue";
import { common } from "../common/common";
import { Log } from "../lib/Log";
import { StaticConfig } from "./StaticConfig";
import { UsersManager } from "../lib/UsersManager";
import * as sc2 from "steemconnect";
import { d } from "../lib/util";

export class Publisher {
    private redis: Redis;
    private vault: Vault;
    private usersManager: UsersManager;
    private queue: ToSendQueue;
    private requiredScope: string [] = [ "custom_json", "vote" ];

    public constructor(redis: Redis, vault: Vault) {
        this.redis = redis;
        this.vault = vault;

        this.usersManager = new UsersManager(this.redis, this.vault, {
            canIssueRefreshTokens: true
        });

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
                    if (i % 10 == 0) Log.log().info("No ops to publish at " + (new Date().toISOString()));
                }
            }
            catch (error) {
                Log.log().exception(Log.level.error, error);
                await BluebirdPromise.delay(200);
            }
            i++;
        }
    }

    private publish(otp: OpsToPublish) {
        (async () => {
            try {
                Log.log().info("Publisher => publish ops " + JSON.stringify(otp));
                await this.doPublish(otp);
            }
            catch (error) {
                Log.log().exception(Log.level.error, error);
                console.error(error);
            }
        })();
    }

    private async doPublish(otp: OpsToPublish) {
        const ops = otp.ops;
        const sc: sc2.SteemConnectV2 = await this.usersManager.constructOfflineSteemConnect(otp.delegator, this.requiredScope);
        console.log("Got SC2, performing broadcast...");
        const resp = await new Promise<any>((resolve, reject) => {
            sc.broadcast(ops, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });

        const result: { id: string; block_num: number; trx_num: number; } = d(resp.result);

        await this.queue.removeFromProcessingQueue(otp);
        Log.log().info("SteemConnect broadcast result =" + JSON.stringify(result, undefined, 2));
        Log.log().info("Successfully pushed operation via steemconnect (trx_id=" + result.id + ")");
    }
}