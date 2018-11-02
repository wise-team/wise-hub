import * as express from "express";
import * as bodyParser from "body-parser";
import * as Redis from "ioredis";
import { common } from "../common/common";
import { Vault } from "../lib/vault/Vault";
import { AppRole } from "../lib/AppRole";

export class App {
    public app: express.Application;
    private redis: Redis.Redis;
    private vault: Vault;

    constructor() {
        this.app = express();
        this.config();
        this.routes();

        const redisUrl = process.env.REDIS_URL;
        if (!redisUrl) throw new Error("Env REDIS_URL is missing.");
        this.redis = new Redis(redisUrl);

        const vaultAddr = process.env.WISE_VAULT_URL;
        if (!vaultAddr) throw new Error("Env WISE_VAULT_URL does not exist.");

        this.vault = new Vault(vaultAddr);
    }

    public async init() {
        console.log("Vault init...");
        await this.vault.init();

        console.log("AppRole login");
        const policies = /*§ §*/["wise-hub-api"]/*§ JSON.stringify(data.config.hub.docker.services.api.appRole.policies(data.config)) §.*/;
        await AppRole.login(this.vault, policies);

        console.log("Get steemconnectClientId");
        const vaultkey_for_steemconnectClientId = /*§ §*/ "/human/steemconnect/client_id" /*§ ' "' + data.config.vault.secrets.humanEnter.steemConnectClientId.key + '" ' §.*/;
        const steemconnectClientId: { v: string } = await this.vault.getSecret(vaultkey_for_steemconnectClientId);

        console.log("SC key:");
        console.log(steemconnectClientId.v.substring(0, 5));
    }

    private config(): void {
        // support application/json type post data
        this.app.use(bodyParser.json());
        // support application/x-www-form-urlencoded post data
        this.app.use(bodyParser.urlencoded({ extended: false }));
    }

    private routes() {
        this.app.get("/", (req, res) => {
            res.send("Error: backend serves all pages at /api/...");
        });

        this.app.get("/api/auth", (req, res) => {
            res.send("Hello world at /api/auth");
        });



        this.app.get("/api/test/delegator/add/:name", async (req, res) => {
            if (!req.params.name) {
                res.status(500);
                res.send("Missing steem account name");
                return;
            }
            const numChanged = await this.redis.sadd(common.redis.delegators, req.params.name);
            if (numChanged > 0) await this.redis.publish(common.redis.channels.delegators.key, common.redis.channels.delegators.list_changed);
            res.send("Added " + req.params.name);
        });

        this.app.get("/api/test/delegator/delete/:name", async (req, res) => {
            if (!req.params.name) {
                res.status(500);
                res.send("Missing steem account name");
                return;
            }
            const numChanged = await this.redis.srem(common.redis.delegators, req.params.name);
            if (numChanged > 0) await this.redis.publish(common.redis.channels.delegators.key, common.redis.channels.delegators.list_changed);
            res.send("Deleted " + req.params.name);
        });

        this.app.get("/api/test/delegator/", async (req, res) => {
            const delegators = await this.redis.smembers(common.redis.delegators);
            res.send("Delegators: " + delegators.join(", "));
        });



        this.app.get("/api/status", async (req, res) => {
            const respObj: any = {};

            const vaultStatus = await this.vault.getStatus();
            respObj.vault = {
                initialized: vaultStatus.initialized,
                sealed: vaultStatus.sealed
            };

            respObj.publicSecret = await this.vault.getSecret("/hub/public/status");
            respObj.daemon = await this.redis.hgetall(common.redis.daemonStatus.key);

            res.send(JSON.stringify(respObj));
        });
    }

}
