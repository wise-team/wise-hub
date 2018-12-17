import * as sc2 from "steemconnect";
import ow from "ow";
import { AccountInfo, OperationWithDescriptor } from "steem";

export class Steemconnect {
    private oauth2ClientId: string;
    private callbackUrl: string;
    // private scope: string [];

    public constructor(oauth2ClientId: string, callbackUrl: string) {
        ow(oauth2ClientId, ow.string.nonEmpty.label("oauth2ClientId"));
        ow(callbackUrl, ow.string.nonEmpty.label("callbackUrl"));

        this.oauth2ClientId = oauth2ClientId;
        this.callbackUrl = callbackUrl;
    }

    public async me(accessToken: string): Promise<Steemconnect.Me> {
        ow(accessToken, ow.string.nonEmpty.label("accessToken"));

        const sc2 = this.constructSC2([]);
        sc2.setAccessToken(accessToken);
        return await new Promise<Steemconnect.Me>((resolve, reject) => {
            sc2.me((error, result) => {
                if (error) reject(this.transformSC2Error(error));
                else resolve(result as any);
            });
        })
        .then(res => {
            ow(res.account, ow.object.label("lib/Steemconnect.ts sc2.me().response.account"));
            ow(res.user_metadata, ow.object.label("lib/Steemconnect.ts sc2.me().response.user_metadata"));
            ow(res.scope, ow.array.ofType(ow.string).label("lib/Steemconnect.ts sc2.me().response.scope"));
            ow(res.name, ow.string.label("lib/Steemconnect.ts sc2.me().response.name"));
            return res;
        });
    }

    public async broadcast(account: string, scope: string [], ops: OperationWithDescriptor [], accessToken: string): Promise<Steemconnect.BroadcastResult> {
        ow(account, ow.string.nonEmpty.label("account"));
        ow(scope, ow.array.nonEmpty.ofType(ow.string).label("scope"));
        ow(ops, ow.array.nonEmpty.ofType(ow.object).label("ops"));
        ow(accessToken, ow.string.nonEmpty.label("accessToken"));

        const sc2 = this.constructSC2(scope);
        sc2.setAccessToken(accessToken);
        const resp = await new Promise<any>((resolve, reject) => {
            sc2.broadcast(ops, (error, result) => {
                if (error) reject(this.transformSC2Error(error));
                else resolve(result);
            });
        });
        ow(resp.result, ow.object.label("sc2.broadcast().response.result"));
        ow(resp.result.id, ow.number.label("sc2.broadcast().response.result.id"));
        ow(resp.result.block_num, ow.number.label("sc2.broadcast().response.result.block_num"));
        ow(resp.result.trx_num, ow.number.label("sc2.broadcast().response.result"));

        const result: { id: string; block_num: number; trx_num: number; } = resp.result;
        return result;
    }

    public async revokeToken(accessToken: string): Promise<any> {
        ow(accessToken, ow.string.nonEmpty.label("accessToken"));

        const sc2 = this.constructSC2([]);
        sc2.setAccessToken(accessToken);
        return await new Promise<any>((resolve, reject) => {
            sc2.revokeToken((error, result) => {
                if (error) reject(this.transformSC2Error(error));
                else resolve(result);
            });
        });
    }

    private constructSC2(scope: string []): sc2.SteemConnectV2 {
        ow(scope, ow.array.ofType(ow.string).label("scope"));

        return sc2.Initialize({
            app: this.oauth2ClientId,
            callbackURL: this.callbackUrl,
            scope: scope
        });
    }

    private transformSC2Error<T>(error: any): Error {
        ow(error, ow.object.label("error"));

        if (error.error_description) {
            const err = new Error(error.message ? error.message : "" + ": "
                    + error.error ? error.error : "" + " "
                    + error.error_description);
            console.error(err);
            return err;
        }
        else return error;
    }
}

export namespace Steemconnect {
    export interface Me {
        account: AccountInfo;
        user_metadata: object;
        scope: string [];
        name: string;
    }

    export interface BroadcastResult {
        id: string;
        block_num: number;
        trx_num: number;
    }
}