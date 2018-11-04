import { Redis } from "ioredis";
import * as express from "express";
import { UsersManager } from "../../lib/UsersManager";
import { asyncReq, d } from "../lib/util";
import { AuthManager } from "../auth/AuthManager";
import { User, isUserSettings } from "../../common/model/User";

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
        app.get("/api/user",
            AuthManager.isUserAuthenticated,
            (req, res) => asyncReq(res, async () => {
                const user: User = d(req.user);
                res.send(JSON.stringify(user));
            })
        );

        app.get("/api/user/settings",
            AuthManager.isUserAuthenticated,
            (req, res) => asyncReq(res, async () => {
                const user: User = d(req.user);
                res.send(JSON.stringify(user.settings));
            })
        );

        app.post("/api/user/settings",
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