import * as _ from "lodash";
import * as express from "express";
import * as ExpressSession from "express-session";
import * as bodyParser from "body-parser";
import * as IORedis from "ioredis";
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
import { AccountsRoutes } from "./routes/AccountsRoutes";
import { stringify } from "querystring";
import { Heartbeat } from "../lib/heartbeat/Heartbeat";
import { HeartbeatImpl } from "../lib/heartbeat/HeartbeatImpl";
import { Redis } from "../lib/redis/Redis";
import { RedisImpl } from "../lib/redis/RedisImpl";

export class App {
    public app: express.Application;
    private sessionOptions: any = {};

    private redisUrl: string;
    private ioredis: IORedis.Redis;
    private vault: Vault;
    private usersManager: UsersManager;
    private authManager: AuthManager;
    private heartbeats: Map<string, Heartbeat>;

    private statusRoutes: StatusRoutes;
    private userRoutes: UserRoutes;
    private accountsRoutes: AccountsRoutes;
    private daemonRoutes: DaemonRoutes;
    private rulesetsRoutes: RulesetsRoutes;

    constructor() {
        this.app = express();

        const redisUrl = process.env.REDIS_URL;
        if (!redisUrl) throw new Error("Env REDIS_URL is missing.");
        this.redisUrl = redisUrl;
        this.ioredis = new IORedis(redisUrl);

        const vaultAddr = process.env.WISE_VAULT_URL;
        if (!vaultAddr) throw new Error("Env WISE_VAULT_URL does not exist.");

        const sessionOptionsStr = process.env.SESSION_OPTIONS;
        if (!sessionOptionsStr) throw new Error("Env COOKIE_OPTIONS does not exist.");
        this.sessionOptions = JSON.parse(sessionOptionsStr);

        this.vault = new Vault(vaultAddr);

        const redis = new RedisImpl(redisUrl);
        this.heartbeats = new Map<string, Heartbeat>();
        this.heartbeats.set("publisher", new HeartbeatImpl(redis, "publisher"));

        this.usersManager = new UsersManager(this.ioredis, this.vault, { canIssueRefreshTokens: true });
        this.authManager = new AuthManager(this.vault, this.usersManager);

        this.statusRoutes = new StatusRoutes(this.ioredis, this.vault, this.heartbeats);
        this.accountsRoutes = new AccountsRoutes(this.ioredis, this.usersManager);
        this.userRoutes = new UserRoutes(this.ioredis, this.usersManager);
        this.daemonRoutes = new DaemonRoutes(this.ioredis);
        this.rulesetsRoutes = new RulesetsRoutes(this.ioredis, this.usersManager);
    }

    public async init() {
        Log.log().debug("Initialising vault connection");
        // prettier-ignore
        const policies = /*§ §*/["wise-hub-api"]/*§ JSON.stringify(data.config.hub.docker.services.api.appRole.policies(data.config)) §.*/;

        await this.vault.init(vault => AppRole.login(vault, policies));

        await this.usersManager.init();

        await this.userRoutes.init();
        await this.accountsRoutes.init();
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
            store: new RedisSessionStore({ url: this.redisUrl }),
            saveUninitialized: true,
            rolling: true,
            // prettier-ignore
            cookie: { maxAge: /*§ §*/604800000/*§ data.config.hub.api.cookie.maxAgeMs §.*/ }
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
            res.send("Error: backend/api serves all pages at /api/...");
        });

        await this.authManager.routes(this.app);
        await this.statusRoutes.routes(this.app);
        await this.userRoutes.routes(this.app);
        await this.accountsRoutes.routes(this.app);
        await this.daemonRoutes.routes(this.app);
        await this.rulesetsRoutes.routes(this.app);

        this.app.get("/api/rules", async (req, res) => {
            const out: any = {};

            const keys = await this.ioredis.keys(common.redis.rules + ":*");
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                if (key.indexOf("@") !== -1) {
                    out[keys[i]] = await this.ioredis.get(keys[i]);
                } else {
                    out[keys[i]] = await this.ioredis.hgetall(keys[i]);
                }
            }

            res.send(JSON.stringify(out, undefined, 2));
        });

        this.app.get("/api/test/delegator/", async (req, res) => {
            const delegators = await this.ioredis.smembers(common.redis.delegators);
            res.send("Delegators: " + delegators.join(", "));
        });
    }
}
