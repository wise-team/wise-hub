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
            const sTime = Date.now();
            let publicSecret: any = undefined;
            const vaultStatus: { initialized?: boolean; sealed?: boolean; error?: string; } = {};
            try {
                const vaultStatusResp = await this.vault.getStatus();
                vaultStatus.initialized = vaultStatusResp.initialized;
                vaultStatus.sealed = vaultStatusResp.sealed;

                publicSecret = await this.vault.getSecret("/hub/public/status");
            }
            catch (error) { vaultStatus.error = error + ""; }

            const daemon = await this.redis.hgetall(common.redis.daemonStatus.key);
            const alive = {
                publisher: await this.redis.exists(common.redis.publisherHartbeat) > 0,
                daemon: await this.redis.exists(common.redis.daemonHartbeat) > 0,
                realtime: await this.redis.exists(common.redis.realtimeHartbeat) > 0,
            };

            const publisher = {
                queueLen: await this.redis.llen(common.redis.toPublishQueue),
                processingLen: await this.redis.llen(common.redis.publishProcessingQueue)
            };

            const took = Date.now() - sTime;

            const payload: StatusResponsePayload = {
                vault: vaultStatus,
                alive: alive,
                publicSecret: publicSecret,
                daemon: daemon,
                publisher: publisher,
                took: took
            };

            res.send(JSON.stringify(payload));
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

export interface StatusResponsePayload {
    vault: {
        initialized?: boolean,
        sealed?: boolean,
        error?: string;
    };
    alive: {
        publisher: boolean;
        daemon: boolean;
        realtime: boolean;
    };
    publisher: {
        queueLen: number;
        processingLen: number;
    };
    daemon: any;
    publicSecret: any;
    took: number;
}