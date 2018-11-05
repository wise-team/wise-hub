import { Redis } from "ioredis";
import * as express from "express";
import * as sc2 from "steemconnect";
import { asyncReq, d } from "../lib/util";
import { AuthManager } from "../auth/AuthManager";
import { User, isUserSettings } from "../../common/model/User";
import { common } from "../../common/common";
import { RulesManager } from "../../daemon/rules/RulesManager";
import Wise, { SteemOperationNumber, SetRulesForVoter, RulesUpdater } from "steem-wise-core";
import { Vault } from "../../lib/vault/Vault";
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
            (req, res) => asyncReq(res, async () => {
                const delegator = d(req.user.account);
                const srfv: SetRulesForVoter = d(req.body);
                if (!SetRulesForVoter.isSetRulesForVoter(srfv)) {
                    throw new Error("Payload is not SetRulesForVoter");
                }
                const ops = RulesUpdater.getUploadRulesetsForVoterOps(
                    Wise.constructDefaultProtocol(),
                    delegator, d(srfv.voter), srfv.rulesets
                );

                const sc: sc2.SteemConnectV2 =
                    await this.usersManager.constructOfflineSteemConnect(delegator, [ "custom_json" ]);

                const resp = await new Promise<any>((resolve, reject) => {
                    sc.broadcast(ops, (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    });
                });

                const result: { id: string; block_num: number; trx_num: number; } = d(resp.result);
                res.send(result);
            })
        );
    }
}