import * as fs from "fs";
import { Log } from "../lib/Log";
import * as Redis from "ioredis";
import { common } from "../common/common";
import { Daemon } from "./Daemon";
import { DelegatorManager } from "../lib/DelegatorManager";
import { AppRole } from "../lib/AppRole";
import { DaemonManager } from "./DaemonManager";
import { ApiHelper } from "./ApiHelper";
import { DaemonLog } from "./DaemonLog";

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


/*****************
 **   CONNECT   **
 *****************/
const redisUrl = process.env.REDIS_URL;
if (!redisUrl) throw new Error("Env REDIS_URL is missing.");
const redis = new Redis(redisUrl);
const daemonLog = new DaemonLog(redis);

const delegatorManager = new DelegatorManager(redis);
const apiHelper = new ApiHelper();
const daemonManager = new DaemonManager(redis, delegatorManager, apiHelper, daemonLog);

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

        Log.log().info("Daemon init done.");
        daemonLog.emit({ msg: "Daemon init done." });

        daemonManager.run();
    }
    catch (error) {
        Log.log().exception(Log.level.error, error);
        console.error(error);
        process.exit(1);
    }
})();