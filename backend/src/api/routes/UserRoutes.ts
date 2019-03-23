import * as express from "express";

import { common } from "../../common/common";
import { isUserSettings, User } from "../../common/model/User";
import { UsersManager } from "../../lib/UsersManager";
import { AuthManager } from "../auth/AuthManager";
import { asyncReq, d } from "../lib/util";

export class UserRoutes {
    private usersManager: UsersManager;

    public constructor(usersManager: UsersManager) {
        this.usersManager = usersManager;
    }

    public async init() {
        //
    }

    public routes(app: express.Application) {
        app.get(common.urls.api.user.base, AuthManager.isUserAuthenticated, (req, res) =>
            asyncReq("api/routes/UserRoutes.ts route user base", res, async () => {
                const requser: User = d(req.user);
                const user: User | undefined = await this.usersManager.getUser(d(requser.account));
                if (!user) {
                    res.status(404);
                    res.send("Not found.");
                } else {
                    res.send(JSON.stringify(user));
                }
            }),
        );

        app.get(common.urls.api.user.settings, AuthManager.isUserAuthenticated, (req, res) =>
            asyncReq("api/routes/UserRoutes.ts route user settings GET", res, async () => {
                const requser: User = d(req.user);
                const user: User | undefined = await this.usersManager.getUser(d(requser.account));
                if (!user) {
                    res.status(404);
                    res.send("Not found.");
                } else {
                    res.send(JSON.stringify(user.settings));
                }
            }),
        );

        app.post(common.urls.api.user.settings, AuthManager.isUserAuthenticated, (req, res) =>
            asyncReq("api/routes/UserRoutes.ts route user settings POST", res, async () => {
                const userSettings = req.body;
                if (!userSettings) throw new Error("Undefined payload");
                if (!isUserSettings(userSettings)) throw new Error("Invalid user settings");

                const user: User = d(req.user);
                const userAfterSave = await this.usersManager.saveUserSettings(d(user.account), userSettings);
                res.send(JSON.stringify({ save: true, user: userAfterSave }));
            }),
        );
    }
}
