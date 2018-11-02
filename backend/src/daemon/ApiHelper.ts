import * as steemJs from "steem";
import { WiseSQLProtocol, EffectuatedWiseOperation } from "steem-wise-core";

export class ApiHelper {
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

    public async getWiseSQL(path: string, params: any, limit: number): Promise<EffectuatedWiseOperation []> {
        return WiseSQLProtocol.Handler.query({
            endpointUrl: this.wiseSQLUrl,
            path: path,
            method: "get",
            limit: limit,
            params: params
        });
    }
}