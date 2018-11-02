import * as fs from "fs";
import { App } from "./app";
import { Log } from "../lib/Log";

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

const appRoleName = /*§ §*/ "wise-hub-api" /*§ ' "' + data.config.hub.docker.services.api.appRole.role + '" ' §.*/;
const appRoleSecretMount = /*§ §*/ "/secret/api-role.json" /*§ ' "' + data.config.hub.docker.services.api.appRole.secretMount + '" ' §.*/;
const secret = JSON.parse(fs.readFileSync(appRoleSecretMount, "UTF-8"));
console.log(secret);
if (secret.role_name !== appRoleName) throw new Error("Secret contains wring role name!");

/*****************
 **     RUN     **
 *****************/

(async () => {
    try {
        const app = new App();
        await app.init();

        Log.log().info("Initialization done.");
        app.app.listen(PORT, () => {
            Log.log().info("Express server listening on port " + PORT);
        });
    }
    catch (error) {
        Log.log().exception(Log.level.error, error);
    }
 })();