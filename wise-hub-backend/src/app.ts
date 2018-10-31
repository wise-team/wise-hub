import * as express from "express";
import * as bodyParser from "body-parser";
import { Vault } from "./lib/vault/Vault";

export class App {
    public app: express.Application;
    private vault: Vault;

    constructor() {
        this.app = express();
        this.config();
        this.routes();

        const vaultAddr = process.env.WISE_VAULT_URL;
        if (!vaultAddr) throw new Error("Env WISE_VAULT_URL does not exist.");
        const vaultDevMode = process.env.WISE_VAULT_DEV_MODE;
        if (!vaultDevMode) throw new Error("Env WISE_VAULT_DEV_MODE does not exist.");
        this.vault = new Vault(vaultAddr, vaultDevMode === "yes");
    }

    public async init() {
        await this.vault.init();
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

        this.app.get("/api", (req, res) => {
            res.send("Hello world at /api");
        });

        this.app.get("/api/auth", (req, res) => {
            res.send("Hello world at /api/auth");
        });


        this.app.get("/api/status", async (req, res) => {
            const respObj: any = {};

            const vaultStatus = await this.vault.getStatus();
            respObj.vault = {
                initialized: vaultStatus.initialized,
                sealed: vaultStatus.sealed
            };

            respObj.publicSecret = await this.vault.getSecret("hub/public/status");

            res.send(JSON.stringify(respObj));
        });
    }

}
