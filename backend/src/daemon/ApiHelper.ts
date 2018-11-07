import * as steemJs from "steem";
import Wise, { WiseSQLProtocol, EffectuatedWiseOperation, WiseSQLApi, DirectBlockchainApi, Protocol, Api } from "steem-wise-core";
import { Log } from "../lib/Log";
import { Redis } from "ioredis";
import { common } from "../common/common";
import Axios from "axios";
import { d } from "../lib/util";
import { BlockLoadingApi } from "./BlockLoadingApi";

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

    public getWiseSQLUrl(): string {
        return this.wiseSQLUrl;
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

    public constructBlockLoadingApi(): BlockLoadingApi {
        return new BlockLoadingApi(this.getSteem());
    }

    public async getWiseSQLBlockNumber(): Promise<number> {
        const resp = await Axios.get(this.wiseSQLUrl + "/properties");
        const p =  d(resp.data)
            .filter((prop: { key: string, value: string }) => d(prop.key) === "last_processed_block");
        return parseInt(d(p[0].value), 10);
    }

    /*public constructApiForRules(): Api {
        const directBlockchain = new DirectBlockchainApi(this.getWiseProtocol(), undefined, { url: this.steemApis[0] });
        return new WiseSQLApi(this.wiseSQLUrl, this.getWiseProtocol(), directBlockchain);
    }*/
}