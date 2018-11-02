import * as fs from "fs";
import { Log } from "../lib/Log";
import * as Redis from "ioredis";
import { common } from "../common/common";
import { Daemon } from "./Daemon";

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

const appRoleName = /*§ §*/ "wise-hub-daemon" /*§ ' "' + data.config.hub.docker.services.daemon.appRole.role + '" ' §.*/;
const appRoleSecretMount = /*§ §*/ "/secret/daemon-role.json" /*§ ' "' + data.config.hub.docker.services.daemon.appRole.secretMount + '" ' §.*/;
const secret = JSON.parse(fs.readFileSync(appRoleSecretMount, "UTF-8"));
console.log(secret);
if (secret.role_name !== appRoleName) throw new Error("Secret contains wring role name!");

const redis = new Redis(redisUrl);

(async () => {
    try {
        Log.log().info("Initialising daemon....");

        // const daemon = new Daemon(redis);
        // daemon.run();

        Log.log().info("Daemon init done.");
    }
    catch (error) {
        Log.log().exception(Log.level.error, error);
        console.error(error);
        process.exit(1);
    }
})();