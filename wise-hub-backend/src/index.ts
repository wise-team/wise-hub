import { App } from "./app";

import { Log } from "./lib/Log";

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

        app.app.listen(PORT, () => {
            console.log("Express server listening on port " + PORT);
        });
    }
    catch (error) {
        Log.log().exception(Log.level.error, error);
    }
 })();