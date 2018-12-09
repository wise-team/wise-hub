import { Redis } from "ioredis";
import * as express from "express";
import { UsersManager } from "../../lib/UsersManager";
import { asyncReq, d } from "../lib/util";
import { AuthManager } from "../auth/AuthManager";
import { User, isUserSettings } from "../../common/model/User";
import { common } from "../../common/common";

export class AccountsRoutes {
    private redis: Redis;
    private usersManager: UsersManager;

    public constructor(redis: Redis, usersManager: UsersManager) {
        this.redis = redis;
        this.usersManager = usersManager;
    }

    public async init() {

    }

    public routes(app: express.Application) {
        app.get(common.urls.api.accounts.base + "/:account/settings",
            (req, res) => asyncReq(res, async () => {
                const accountName = d(req.params.account, "req.params.account");
                const user: User | undefined = await this.usersManager.getUser(accountName);
                if (!user) {
                    res.status(404);
                    res.send("Not found.");
                }
                else {
                    res.send(JSON.stringify(user.settings));
                }
            })
        );
    }
}