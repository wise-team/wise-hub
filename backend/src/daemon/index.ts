import * as fs from "fs";
import { Log } from "../lib/Log";
import * as IORedis from "ioredis";
import { common } from "../common/common";
import { Daemon } from "./Daemon";
import { DelegatorManager } from "../lib/DelegatorManager";
import { AppRole } from "../lib/AppRole";
import { DaemonManager } from "./DaemonManager";
import { ApiHelper } from "./ApiHelper";
import { DaemonLog } from "./DaemonLog";
import { WiseOperationsLog } from "./WiseOperationsLog";
import { PublisherQueue } from "../publisher/queue/PublisherQueue";
import { PublisherQueueImpl } from "../publisher/queue/PublisherQueueImpl";
import { RedisDualQueueImpl } from "../publisher/queue/RedisDualQueueImpl";
import { Redis } from "../lib/redis/Redis";
import { RedisImpl } from "../lib/redis/RedisImpl";

/******************
 ** INTIAL SETUP **
 ******************/
Log.log().initialize();

process.on("unhandledRejection", err => {
    console.error("Unhandled promise");
    Log.log().error("UNHANDLED PROMISE -> aborting exit");
    Log.log().error(err);
    console.error(err);
    process.exit(1);
});

/*****************
 **   CONNECT   **
 *****************/
const redisUrl = process.env.REDIS_URL;
if (!redisUrl) throw new Error("Env REDIS_URL is missing.");
const ioredis = new IORedis(redisUrl);
const redis: Redis = new RedisImpl(redisUrl);

const daemonLog = new DaemonLog(ioredis);

const delegatorManager = new DelegatorManager(ioredis);
const apiHelper = new ApiHelper();

const publisherQueue: PublisherQueue = new PublisherQueueImpl(
    new RedisDualQueueImpl(redis, {
        processingQueueKey: common.redis.publishProcessingQueue,
        waitingQueueKey: common.redis.toPublishQueue,
    })
);

const daemonManager = new DaemonManager(ioredis, delegatorManager, apiHelper, daemonLog, publisherQueue);

process.on("SIGTERM", () => {
    daemonManager.stop();
});

/*****************
 **     RUN     **
 *****************/
(async () => {
    try {
        Log.log().info("Initialising daemon....");
        daemonLog.emit({ msg: "Initialising daemon..." });

        await apiHelper.init();
        await delegatorManager.init(redisUrl);

        await WiseOperationsLog.preload(ioredis, apiHelper);

        Log.log().info("Daemon init done.");
        daemonLog.emit({ msg: "Daemon init done." });

        daemonManager.run();
    } catch (error) {
        Log.log().logError("daemon/index.ts in async call", error);
        process.exit(1);
    }
})();
