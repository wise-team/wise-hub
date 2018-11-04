import { Redis } from "ioredis";
import * as express from "express";
import { UsersManager } from "../../lib/UsersManager";
import { asyncReq, d } from "../lib/util";
import { AuthManager } from "../auth/AuthManager";
import { User, isUserSettings } from "../../common/model/User";
import { common } from "../../common/common";

export class UserRoutes {
    private redis: Redis;
    private usersManager: UsersManager;

    public constructor(redis: Redis, usersManager: UsersManager) {
        this.redis = redis;
        this.usersManager = usersManager;
    }

    public async init() {

    }

    public routes(app: express.Application) {
        app.get(common.urls.api.user.base,
            AuthManager.isUserAuthenticated,
            (req, res) => asyncReq(res, async () => {
                const requser: User = d(req.user);
                const user: User | undefined = await this.usersManager.getUser(d(requser.account));
                if (!user) {
                    res.status(404);
                    res.send("Not found.");
                }
                else {
                    res.send(JSON.stringify(user));
                }
            })
        );

        app.get(common.urls.api.user.settings,
            AuthManager.isUserAuthenticated,
            (req, res) => asyncReq(res, async () => {
                const requser: User = d(req.user);
                const user: User | undefined = await this.usersManager.getUser(d(requser.account));
                if (!user) {
                    res.status(404);
                    res.send("Not found.");
                }
                else {
                    res.send(JSON.stringify(user.settings));
                }
            })
        );

        app.post(common.urls.api.user.settings,
            AuthManager.isUserAuthenticated,
            (req, res) => asyncReq(res, async () => {
                const userSettings = req.body;
                if (!userSettings) throw new Error("Undefined payload");
                if (!isUserSettings(userSettings)) throw new Error("Invalid user settings");

                const user: User = d(req.user);
                const userAfterSave = await this.usersManager.saveUserSettings(d(user.account), userSettings);
                res.send(JSON.stringify({ save: true, user: userAfterSave }));
            })
        );
    }
}