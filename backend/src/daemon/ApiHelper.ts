import * as steemJs from "steem";
import Wise, { WiseSQLProtocol, EffectuatedWiseOperation, WiseSQLApi, DirectBlockchainApi, Protocol, Api } from "steem-wise-core";
import { Log } from "../lib/Log";
import { Redis } from "ioredis";
import { common } from "../common/common";

export class ApiHelper {
    private protocol: Protocol = Wise.constructDefaultProtocol();
    private steemApis: string [];
    private steem: steemJs.api.Steem;
    private wiseSQLUrl: string;

    public constructor() {
        const steemApiUrlList = process.env.STEEM_API_URL;
        if (!steemApiUrlList) throw new Error("Env STEEM_API_URL is missing");
        this.steemApis = steemApiUrlList.split(",");
        if (this.steemApis.length === 0) throw new Error("No steemd api specified!");
        this.steem = new steemJs.api.Steem({ url: this.steemApis[0] });

        const wiseSQLUrl = process.env.WISE_SQL_ENDPOINT_URL;
        if (!wiseSQLUrl) throw new Error("Env WISE_SQL_ENDPOINT_URL is missing");
        this.wiseSQLUrl = wiseSQLUrl;
    }

    public async init() {
    }

    public getSteem(): steemJs.api.Steem {
        return this.steem;
    }

    public getWiseProtocol(): Protocol {
        return this.protocol;
    }

    public async getWiseSQL(path: string, params: any, limit: number): Promise<EffectuatedWiseOperation []> {
        return WiseSQLProtocol.Handler.query({
            endpointUrl: this.wiseSQLUrl,
            path: path,
            method: "get",
            limit: limit,
            params: params
        });
    }

    public constructApiForDaemon(): Api {
        const directBlockchain = new DirectBlockchainApi(this.getWiseProtocol(), undefined, { url: this.steemApis[0] });
        return directBlockchain;
    }

    /*public constructApiForRules(): Api {
        const directBlockchain = new DirectBlockchainApi(this.getWiseProtocol(), undefined, { url: this.steemApis[0] });
        return new WiseSQLApi(this.wiseSQLUrl, this.getWiseProtocol(), directBlockchain);
    }*/
}