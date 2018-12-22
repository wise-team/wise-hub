import { Redis } from "ioredis";
import * as BluebirdPromise from "bluebird";
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
        app.get("/api/status", (req, res) => asyncReq("api/routes/StatusRoutes.ts route status", res, async () => {
            const payload: StatusResponsePayload = await this.getStatus();

            res.send(JSON.stringify(payload));
        }));

        app.get("/api/publisher/queue", (req, res) => asyncReq("api/routes/StatusRoutes.ts route publisher queue", res, async () => {
            const toPublishQueue = await this.redis.lrange(common.redis.toPublishQueue, 0, 500);
            const publishProcessingQueue = await this.redis.lrange(common.redis.publishProcessingQueue, 0, 500);

            res.send(JSON.stringify({
                to_publish: toPublishQueue,
                processing: publishProcessingQueue
            }));
        }));
    }

    private async getStatus(): Promise<StatusResponsePayload> {
        await BluebirdPromise.delay(100); // This is heavy request (~1500ms), so in order to prevent DDoS we include this small delay
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
            took: took,
            verdict: { type: "VERDICT_UNHEALTHY", msg: "Verdict not yet processed" }
        };
        payload.verdict = this.getStatusVerdict(payload);
        return payload;
    }

    private getStatusVerdict(s: StatusResponsePayload): { type: "VERDICT_UNHEALTHY" | "VERDICT_HEALTHY", msg: string } {
        if (s.vault.error && s.vault.error.length > 0)
            return { type: "VERDICT_UNHEALTHY", msg: "Vault error: " + s.vault.error };

        if (!s.vault.initialized)
            return { type: "VERDICT_UNHEALTHY", msg: "Vault not initialized" };

        if (s.vault.sealed)
            return { type: "VERDICT_UNHEALTHY", msg: "Vault is sealed" };

        if (!s.alive.daemon)
            return { type: "VERDICT_UNHEALTHY", msg: "Daemon is not alive" };

        if (!s.alive.publisher)
            return { type: "VERDICT_UNHEALTHY", msg: "Publisher is not alive" };

        if (!s.alive.realtime)
            return { type: "VERDICT_UNHEALTHY", msg: "Realtime is not alive" };

        if (s.publisher.queueLen > 15)
            return { type: "VERDICT_UNHEALTHY", msg: "Queue length > 15" };

        if (s.publisher.processingLen > 15)
            return { type: "VERDICT_UNHEALTHY", msg: "Processing queue length > 15" };

        if (s.took > 3000)
            return { type: "VERDICT_UNHEALTHY", msg: "Status generation took > 3s" };

        return { type: "VERDICT_HEALTHY", msg: "" };
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
    verdict: {
        type: "VERDICT_HEALTHY" | "VERDICT_UNHEALTHY";
        msg: string;
    };
}