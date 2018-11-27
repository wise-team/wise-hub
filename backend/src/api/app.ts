import * as _ from "lodash";
import * as express from "express";
import * as ExpressSession from "express-session";
import * as bodyParser from "body-parser";
import * as Redis from "ioredis";
import * as connectRedis from "connect-redis";
import { common } from "../common/common";
import { Vault } from "../lib/vault/Vault";
import { AppRole } from "../lib/AppRole";
import { AuthManager } from "./auth/AuthManager";
import { UsersManager } from "../lib/UsersManager";
import { StatusRoutes } from "./routes/StatusRoutes";
import { UserRoutes } from "./routes/UserRoutes";
import * as helmet from "helmet";
import { Log } from "../lib/Log";
import { DaemonRoutes } from "./routes/DaemonRoutes";
import { RulesetsRoutes } from "./routes/RulesetsRoutes";

export class App {
    public app: express.Application;
    private sessionOptions: any = {};

    private redisUrl: string;
    private redis: Redis.Redis;
    private vault: Vault;
    private usersManager: UsersManager;
    private authManager: AuthManager;

    private statusRoutes: StatusRoutes;
    private userRoutes: UserRoutes;
    private daemonRoutes: DaemonRoutes;
    private rulesetsRoutes: RulesetsRoutes;

    constructor() {
        this.app = express();

        const redisUrl = process.env.REDIS_URL;
        if (!redisUrl) throw new Error("Env REDIS_URL is missing.");
        this.redisUrl = redisUrl;
        this.redis = new Redis(redisUrl);

        const vaultAddr = process.env.WISE_VAULT_URL;
        if (!vaultAddr) throw new Error("Env WISE_VAULT_URL does not exist.");

        const sessionOptionsStr = process.env.SESSION_OPTIONS;
        if (!sessionOptionsStr) throw new Error("Env COOKIE_OPTIONS does not exist.");
        this.sessionOptions = JSON.parse(sessionOptionsStr);

        this.vault = new Vault(vaultAddr);

        this.usersManager = new UsersManager(this.redis, this.vault, {
            canIssueRefreshTokens: true
        });
        this.authManager = new AuthManager(this.vault, this.usersManager);

        this.statusRoutes = new StatusRoutes(this.redis, this.vault);
        this.userRoutes = new UserRoutes(this.redis, this.usersManager);
        this.daemonRoutes = new DaemonRoutes(this.redis);
        this.rulesetsRoutes = new RulesetsRoutes(this.redis, this.usersManager);
    }

    public async init() {
        Log.log().debug("Initialising vault connection");
        const policies = /*§ §*/["wise-hub-api"]/*§ JSON.stringify(data.config.hub.docker.services.api.appRole.policies(data.config)) §.*/;
        await this.vault.init(vault => AppRole.login(vault, policies));

        await this.usersManager.init();

        await this.userRoutes.init();
        await this.statusRoutes.init();
        await this.daemonRoutes.init();
        await this.rulesetsRoutes.init();

        await this.config();
        await this.routes();
    }

    private async config() {
        const sessionSecretSecret = await this.vault.getSecret(common.vault.secrets.sessionSecret);
        if (!sessionSecretSecret || !sessionSecretSecret.v) throw new Error("Coult not get session secret from vault");
        const sessionSecret = sessionSecretSecret.v;

        // support application/json type post data
        this.app.use(bodyParser.json());
        // support application/x-www-form-urlencoded post data
        this.app.use(bodyParser.urlencoded({ extended: false }));

        const RedisSessionStore = connectRedis(ExpressSession);
        const sessionDynamicOpts: ExpressSession.SessionOptions = {
            secret: sessionSecret,
            store: new RedisSessionStore({ url: this.redisUrl })
        };
        const resolvedSessionOptions = _.merge({}, this.sessionOptions, sessionDynamicOpts);

        this.app.use(ExpressSession(resolvedSessionOptions));
        this.app.use(helmet());
        this.app.use(helmet.noCache());
        this.app.disable("etag"); // prevent express from sending 304

        await this.authManager.configure(this.app);
    }

    private async routes() {
        this.app.get("/", (req, res) => {
            res.send("Error: backend serves all pages at /api/...");
        });

        this.authManager.routes(this.app);
        this.statusRoutes.routes(this.app);
        this.userRoutes.routes(this.app);
        this.daemonRoutes.routes(this.app);
        this.rulesetsRoutes.routes(this.app);

        this.app.get("/api/rules", async (req, res) => {
            const out: any = {};

            const keys = await this.redis.keys(common.redis.rules + ":*");
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                if (key.indexOf("@") !== -1) {
                    out[keys[i]] = await this.redis.get(keys[i]);
                }
                else {
                    out[keys[i]] = await this.redis.hgetall(keys[i]);
                }
            }

            res.send(JSON.stringify(out, undefined, 2));
        });

        this.app.get("/api/test/delegator/", async (req, res) => {
            const delegators = await this.redis.smembers(common.redis.delegators);
            res.send("Delegators: " + delegators.join(", "));
        });
    }

}
