import * as express from "express";

import { common } from "../../common/common";
import { User } from "../../common/model/User";
import { UsersManager } from "../../lib/UsersManager";
import { asyncReq, d } from "../lib/util";

export class AccountsRoutes {
    private usersManager: UsersManager;

    public constructor(usersManager: UsersManager) {
        this.usersManager = usersManager;
    }

    public async init() {
        //
    }

    public routes(app: express.Application) {
        app.get(common.urls.api.accounts.base + "/:account/settings", (req, res) =>
            asyncReq("api/routes/AccountRoutes.ts.ts route account settings", res, async () => {
                const accountName = d(req.params.account, "req.params.account");
                const user: User | undefined = await this.usersManager.getUser(accountName);
                if (!user) {
                    res.status(404);
                    res.send("Not found.");
                } else {
                    res.send(JSON.stringify(user.settings));
                }
            }),
        );
    }
}
