import { Log } from "./lib/Log";
import * as Redis from "ioredis";
import { common } from "./common.gen";

/******************
 ** INTIAL SETUP **
 ******************/
Log.log().initialize();

process.on("unhandledRejection", (err) => {
    console.error("Unhandled promise");
    Log.log().error("UNHANDLED PROMISE -> aborting exit");
    Log.log().error(err);
    console.error(err);
    process.exit(1);
});

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) throw new Error("Env REDIS_URL is missing.");
const redis = new Redis(redisUrl);

(async () => {
    try {
        Log.log().info("Initialising daemon....");
        await redis.hset(common.redis.daemonStatus.key,
                common.redis.daemonStatus.props.daemon_start_time_iso, new Date().toISOString());

        Log.log().info("Daemon init done.");
    }
    catch (error) {
        Log.log().exception(Log.level.error, error);
        console.error(error);
        process.exit(1);
    }
})();