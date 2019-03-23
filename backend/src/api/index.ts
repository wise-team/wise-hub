// tslint:disable no-console
import { Log } from "../lib/Log";

import { App } from "./app";
import { Watchdogs } from "./Watchdogs";

/******************
 ** INTIAL SETUP **
 ******************/
Log.log().initialize();

process.on("unhandledRejection", err => {
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
        const watchdogs = new Watchdogs();
        await watchdogs.start();

        const app = new App();
        await app.init();

        Log.log().info("WiseHUB backend/api done.");
        const srv = app.app.listen(PORT, () => {
            Log.log().info("Express server listening on port " + PORT);
        });

        process.on("SIGTERM", function() {
            srv.close(function() {
                Log.log().info("Graceful shutdown");
                process.exit(0);
            });
        });
    } catch (error) {
        Log.log().error("api/index.ts async runner", error);
    }
})();
