
import { Redis } from "ioredis";
import * as express from "express";
import { UsersManager } from "../../lib/UsersManager";
import { Vault, d } from "../../lib/vault/Vault";
import { common } from "../../common/common";
import { asyncReq } from "../lib/util";

export class DaemonRoutes {
    private redis: Redis;

    public constructor(redis: Redis) {
        this.redis = redis;
    }

    public async init() {

    }

    public routes(app: express.Application) {
        app.get("/api/daemon/log", (req, res) => asyncReq("api/routes/DaemonRoutes.ts route logout", res, async () => {
            const items = await this.redis.lrange(common.redis.daemonLogGeneral, 0, 99999);

            res.send(JSON.stringify(items));
        }));

        app.get("/api/daemon/operations/log", (req, res) => asyncReq("api/routes/DaemonRoutes.ts route operations log", res, async () => {
            const items = await this.redis.lrange(common.redis.wiseOperationsLog, 0, 99999);
            res.send(JSON.stringify(items));
        }));

        app.get("/api/daemon/log/:delegator", (req, res) => asyncReq("api/routes/DaemonRoutes.ts route delegator log", res, async () => {
            const respObj: any = {};

            const items = await this.redis.lrange(common.redis.daemonLogFor + ":" + d(req.params.delegator), 0, 99999);
            if (items) {
                res.send(JSON.stringify(items));
            }
            else {
                res.status(404);
                res.send("Log fot this delegator not found");
            }
        }));
    }
}