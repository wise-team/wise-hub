// tslint:disable no-console
import * as IORedis from "ioredis";

import { common } from "../common/common";
import { DaemonLog } from "../daemon/DaemonLog";
import { AppRole } from "../lib/AppRole";
import { Heartbeat } from "../lib/heartbeat/Heartbeat";
import { HeartbeatImpl } from "../lib/heartbeat/HeartbeatImpl";
import { Log } from "../lib/Log";
import { Redis } from "../lib/redis/Redis";
import { RedisImpl } from "../lib/redis/RedisImpl";
import { UsersManager } from "../lib/UsersManager";
import { spawnAsync } from "../lib/util";
import { Vault } from "../lib/vault/Vault";

import { Broadcaster } from "./broadcaster/Broadcaster";
import { BroadcasterImpl } from "./broadcaster/BroadcasterImpl";
import { PublishJob } from "./entities/PublishJob";
import { PublisherLog } from "./log/PublisherLog";
import { PublisherLogImpl } from "./log/PublisherLogImpl";
import { BlockingQueueConsumer } from "./queue/BlockingQueueConsumer";
import { BlockingQueueConsumerImpl } from "./queue/BlockingQueueConsumerImpl";
import { PublisherQueue } from "./queue/PublisherQueue";
import { PublisherQueueImpl } from "./queue/PublisherQueueImpl";
import { RedisDualQueueImpl } from "./queue/RedisDualQueueImpl";
import { StaticConfig } from "./StaticConfig";
import { Watchdogs } from "./Watchdogs";

/******************
 ** INTIAL SETUP **
 ******************/
Log.log().initialize();

process.on("unhandledRejection", err => {
    console.error("Unhandled promise");
    console.error(err);
    Log.log().error("UNHANDLED PROMISE -> exitting with rc 1");
    Log.log().error(err);
    process.exit(1);
});

/*****************
 **   ENV   **
 *****************/
const redisUrl = process.env.REDIS_URL;
if (!redisUrl) throw new Error("Env REDIS_URL is missing.");

const vaultAddr = process.env.WISE_VAULT_URL;
if (!vaultAddr) throw new Error("Env WISE_VAULT_URL does not exist.");

/*****************
 **     RUN     **
 *****************/
(async () => {
    try {
        Log.log().info("Starting hub/backend/publisher...");

        const vault = new Vault(vaultAddr);
        const redis: Redis = new RedisImpl(redisUrl);
        const ioredis = new IORedis(redisUrl);

        await vault.init(vaultI => AppRole.login(vaultI, StaticConfig.REQUIRED_VAULT_POLICIES));

        const usersManager = new UsersManager(ioredis, vault, { canIssueRefreshTokens: true });
        const daemonLog = new DaemonLog(ioredis);
        const publisherLog: PublisherLog = new PublisherLogImpl({
            log: async (msg: PublisherLog.Message) => await daemonLog.emit(msg),
            fallbackLog: (msg: string, error?: Error) => console.error(msg, error),
        });
        const publisherQueue: PublisherQueue = new PublisherQueueImpl(
            new RedisDualQueueImpl(redis, {
                waitingQueueKey: common.redis.toPublishQueue,
                processingQueueKey: common.redis.publishProcessingQueue,
            }),
        );
        const heartbeat: Heartbeat = new HeartbeatImpl(redis, StaticConfig.SERVICE_NAME);
        const watchdogs = new Watchdogs();
        await watchdogs.start();

        const broadcaster: Broadcaster = new BroadcasterImpl({
            usersManager,
            retryDelaysSeconds: StaticConfig.RETRIES_DELAYS_SECONDS,
            broadcastScope: StaticConfig.BROADCAST_SCOPE,
            onWarning: (job: PublishJob, msg: string, error?: Error) => {
                Log.log().warn(msg, error);
                spawnAsync(async () => await publisherLog.logBroadcasterWarning(job, msg + error || ""));
            },
        });

        let jobConsumer: BlockingQueueConsumer<PublisherQueue.JobEntry, Broadcaster.Result>;
        jobConsumer = new BlockingQueueConsumerImpl(
            {
                sleepAfterErrorMs: StaticConfig.PUBLISH_THROTTLING_MS,
                sleepBeforeNextTakeMs: StaticConfig.PUBLISH_THROTTLING_MS,
            },
            {
                init: () => publisherQueue.resetProcessingQueue(),
                heartbeat: () => {
                    heartbeat.beat(StaticConfig.HEARTBEAT_TTL_SECONDS);
                    watchdogs.heartbeatBeatSeconds(StaticConfig.HEARTBEAT_TTL_SECONDS);
                },
                onError: async (error: Error) => Log.log().error("Error in publisher job consumer", error),
                fallbackLog: (msg: string, error?: Error) => console.error(msg, error),
                //
                take: async () => {
                    return await publisherQueue.takeJob(StaticConfig.JOB_BLOCKINGWAIT_SECONDS);
                },
                process: async (job: PublishJob) => {
                    publisherLog.logJobStart(job);
                    PublishJob.validate(job);
                    return await broadcaster.broadcast(job);
                },
                onProcessSuccess: async (job: PublisherQueue.JobEntry, result: Broadcaster.Result) => {
                    await publisherQueue.finishJob(job);
                    await publisherLog.logJobSuccess(job, result);
                },
                onProcessFailure: async (job: PublisherQueue.JobEntry, error: Error) => {
                    await publisherLog.logJobFailure(job, error);
                    await publisherQueue.finishJob(job);
                },
            },
        );
        jobConsumer.start();

        Log.log().info("hub/backend/publisher startup done");
    } catch (error) {
        Log.log().error("publisher/index.ts async runner", error);
        process.exit(1);
    }
})();
