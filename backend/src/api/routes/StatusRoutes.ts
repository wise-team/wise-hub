import { Redis } from "ioredis";
import * as express from "express";
import { UsersManager } from "../../lib/UsersManager";
import { Vault } from "../../lib/vault/Vault";
import { common } from "../../common/common";
import { asyncReq } from "../lib/util";

export class StatusRoutes {
    private redis: Redis;
    private vault: Vault;

    public constructor(redis: Redis, vault: Vault) {
        this.redis = redis;
        this.vault = vault;
    }

    public async init() {

    }

    public routes(app: express.Application) {
        app.get("/api/status", (req, res) => asyncReq(res, async () => {
            const respObj: any = {};

            const vaultStatus = await this.vault.getStatus();
            respObj.vault = {
                initialized: vaultStatus.initialized,
                sealed: vaultStatus.sealed
            };

            respObj.publicSecret = await this.vault.getSecret("/hub/public/status");
            respObj.daemon = await this.redis.hgetall(common.redis.daemonStatus.key);
            respObj.alive = {
                publisher: await this.redis.exists(common.redis.publisherHartbeat),
                daemon: await this.redis.exists(common.redis.daemonHartbeat)
            };

            res.send(JSON.stringify(respObj));
        }));

        app.get("/api/publisher/queue", (req, res) => asyncReq(res, async () => {
            const toPublishQueue = await this.redis.lrange(common.redis.toPublishQueue, 0, 500);
            const publishProcessingQueue = await this.redis.lrange(common.redis.publishProcessingQueue, 0, 500);

            res.send(JSON.stringify({
                to_publish: toPublishQueue,
                processing: publishProcessingQueue
            }));
        }));
    }
}