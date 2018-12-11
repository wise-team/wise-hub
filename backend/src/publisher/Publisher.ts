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
import { DaemonLog } from "../daemon/DaemonLog";

export class Publisher {
    private redis: Redis;
    private vault: Vault;
    private usersManager: UsersManager;
    private queue: ToSendQueue;
    private daemonLog: DaemonLog;
    private requiredScope: string [] = [ "custom_json", "vote" ];

    public constructor(redis: Redis, vault: Vault, daemonLog: DaemonLog) {
        this.redis = redis;
        this.vault = vault;
        this.daemonLog = daemonLog;

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
                    await this.throttle();
                }
                else {
                    if (i % 100 == 0) Log.log().info("No ops to publish at " + (new Date().toISOString()));
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
                this.daemonLog.emit({ msg: "Publisher is publishing operations to blockchain via SteemConnect... Account: @"
                    + otp.delegator + ". Operations: " + otp.ops.map(op => op[0]).join(", ") }, otp.delegator);
                await this.doPublish(otp);
                await this.removeFromQueue(otp);
            }
            catch (error) {
                try {
                    await this.processPublishError(otp, error);
                }
                catch (errorInError) {
                    Log.log().error("Error in error publish processing code");
                    Log.log().exception(Log.level.error, errorInError);
                }
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

        Log.log().info("SteemConnect broadcast result =" + JSON.stringify(result, undefined, 2));
        Log.log().info("Successfully pushed operation via steemconnect (trx_id=" + result.id + ")");
        this.daemonLog.emit({
            msg: "Successful publish to blockchain via SteemConnect to account @" + otp.delegator,
            transaction: { trx_id: result.id, block_num: result.block_num, trx_num: result.trx_num }
        }, otp.delegator);
    }

    private async throttle() {
        const time = StaticConfig.PUBLISH_THROTTLING_MS;
        const msg = "Throttling send. Waiting " + time + "ms before publishing next ops";
        Log.log().info(msg);
        this.daemonLog.emit({ msg: msg });
        await BluebirdPromise.delay(StaticConfig.PUBLISH_THROTTLING_MS);
    }

    private async removeFromQueue(otp: OpsToPublish) {
        await this.queue.removeFromProcessingQueue(otp);
    }

    private async processPublishError(otp: OpsToPublish, error: Error) {
        let errorMsg = "Error when publishing ops to account @" + otp.delegator + " via SteemConnect: ";
        if (error.name === "SDKError" && (error as any).error === "server_error") {
            errorMsg += "Steemconnect error: " + ((error as any).error_description ? (error as any).error_description : error + "");
            errorMsg += "Because of this kind of error, the operation will be removed from queue.";
            await this.removeFromQueue(otp);
            console.error("SC2SDKError", error);
        }
        else {
            errorMsg += error.name + ": " + error.message;
            Log.log().exception(Log.level.error, error);
            console.error(error);
        }
        errorMsg = "" + error;

        this.daemonLog.emit({ msg: errorMsg, error: error + "" }, otp.delegator);
    }
}