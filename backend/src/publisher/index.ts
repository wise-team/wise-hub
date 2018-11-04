import * as fs from "fs";
import { Log } from "../lib/Log";
import * as Redis from "ioredis";
import { common } from "../common/common";
import { Vault } from "../lib/vault/Vault";
import { AppRole } from "../lib/AppRole";
import { Publisher } from "./Publisher";

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

const vaultAddr = process.env.WISE_VAULT_URL;
 if (!vaultAddr) throw new Error("Env WISE_VAULT_URL does not exist.");
const vault = new Vault(vaultAddr);



/*****************
 **     RUN     **
 *****************/
(async () => {
    try {
        Log.log().info("Initialising publisher....");

        await vault.init();
        const requiredPolicies = /*§ §*/["wise-hub-daemon"]/*§ JSON.stringify(data.config.hub.docker.services.publisher.appRole.policies(data.config)) §.*/;
        Log.log().debug("AppRole login to Vault...");
        await AppRole.login(vault, requiredPolicies);
        await vault.setSecret("/hub/public/status", { start_time: new Date().toISOString(), policies: requiredPolicies });
        Log.log().info("AppRole login successful");

        const publisher = new Publisher(redis, vault);
        publisher.run();
    }
    catch (error) {
        Log.log().exception(Log.level.error, error);
        console.error(error);
        process.exit(1);
    }
})();