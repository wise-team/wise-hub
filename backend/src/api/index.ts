import * as fs from "fs";
import { App } from "./app";
import { Log } from "../lib/Log";
import { Vault } from "../lib/vault/Vault";
import { AppRole } from "../lib/AppRole";

/******************
 ** INTIAL SETUP **
 ******************/
Log.log().initialize();

process.on("unhandledRejection", (err) => {
    console.error("Unhandled promise");
    Log.log().error("UNHANDLED PROMISE -> aborting exit");
    Log.log().error(err);
    console.error(err);
    // process.exit(1);
});


/***************
 ** CONFIGURE **
 ***************/
const PORT = 3000;


/*****************
 **     RUN     **
 *****************/

(async () => {
    try {
        const app = new App();
        await app.init();

        Log.log().info("WiseHUB backend/api done.");
        const srv = app.app.listen(PORT, () => {
            Log.log().info("Express server listening on port " + PORT);
        });

        process.on("SIGTERM", function () {
            srv.close(function () {
                Log.log().info("Graceful shutdown");
                process.exit(0);
            });
        });
    }
    catch (error) {
        Log.log().logError("api/index.ts async runner", error);
    }
 })();