import * as express from "express";
import * as bodyParser from "body-parser";

export class App {
    public app: express.Application;

    constructor() {
        this.app = express();
        this.config();
        this.routes();
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
    }

}
