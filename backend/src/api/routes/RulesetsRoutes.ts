import { Redis } from "ioredis";
import * as express from "express";
import { asyncReq, d } from "../lib/util";
import { AuthManager } from "../auth/AuthManager";
import Wise, { SteemOperationNumber, SetRulesForVoter, RulesUpdater } from "steem-wise-core";
import { UsersManager } from "../../lib/UsersManager";

export class RulesetsRoutes {
    private redis: Redis;
    private usersManager: UsersManager;

    public constructor(redis: Redis, usersManager: UsersManager) {
        this.redis = redis;
        this.usersManager = usersManager;
    }

    public async init() {

    }

    public routes(app: express.Application) {
        app.post("/api/rulesets/publish",
            AuthManager.isUserAuthenticated,
            (req, res) => asyncReq("api/routes/RulesetsRoutes.ts route publish", res, async () => {
                const delegator = d(req.user.account);
                const srfv: SetRulesForVoter = d(req.body);
                if (!SetRulesForVoter.isSetRulesForVoter(srfv)) {
                    throw new Error("Payload is not SetRulesForVoter");
                }
                const ops = RulesUpdater.getUploadRulesetsForVoterOps(
                    Wise.constructDefaultProtocol(),
                    delegator, d(srfv.voter), srfv.rulesets
                );

                const result =
                    await this.usersManager.broadcast(delegator, [ "custom_json" ], ops);

                res.send(result);
            })
        );
    }
}