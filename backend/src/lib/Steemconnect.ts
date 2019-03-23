import ow from "ow";
import { AccountInfo, OperationWithDescriptor } from "steem";
import * as sc2 from "steemconnect";

import { Log } from "./Log";

export class Steemconnect {
    private oauth2ClientId: string;
    private callbackUrl: string;

    public constructor(oauth2ClientId: string, callbackUrl: string) {
        ow(oauth2ClientId, ow.string.nonEmpty.label("oauth2ClientId"));
        ow(callbackUrl, ow.string.nonEmpty.label("callbackUrl"));

        this.oauth2ClientId = oauth2ClientId;
        this.callbackUrl = callbackUrl;
    }

    public async me(accessToken: string): Promise<Steemconnect.Me> {
        ow(accessToken, ow.string.nonEmpty.label("accessToken"));

        const sc2Instance = this.constructSC2([]);
        sc2Instance.setAccessToken(accessToken);

        const steemconnectResponse = await new Promise<Steemconnect.Me>((resolve, reject) => {
            sc2Instance.me((error, result) => {
                if (error) reject(this.transformSC2Error(error));
                else resolve(result as any);
            });
        });
        Log.log().debug("steemconnect_me_response", { response: steemconnectResponse });
        ow(steemconnectResponse.account, ow.object.label("lib/Steemconnect.ts sc2.me().response.account"));
        ow(
            steemconnectResponse.user_metadata,
            ow.any(ow.object.label("lib/Steemconnect.ts sc2.me().response.user_metadata"), ow.undefined),
        );
        ow(steemconnectResponse.scope, ow.array.ofType(ow.string).label("lib/Steemconnect.ts sc2.me().response.scope"));
        ow(steemconnectResponse.name, ow.string.label("lib/Steemconnect.ts sc2.me().response.name"));

        return steemconnectResponse;
    }

    public async broadcast(
        account: string,
        scope: string[],
        ops: OperationWithDescriptor[],
        accessToken: string,
    ): Promise<Steemconnect.BroadcastResult> {
        ow(account, ow.string.nonEmpty.label("account"));
        ow(scope, ow.array.nonEmpty.ofType(ow.string).label("scope"));
        ow(ops, ow.array.nonEmpty.ofType(ow.object).label("ops"));
        ow(accessToken, ow.string.nonEmpty.label("accessToken"));

        const sc2Instance = this.constructSC2(scope);
        sc2Instance.setAccessToken(accessToken);
        const resp = await new Promise<any>((resolve, reject) => {
            sc2Instance.broadcast(ops, (error, broadcastResult) => {
                if (error) reject(this.transformSC2Error(error));
                else resolve(broadcastResult);
            });
        });

        ow(resp.result, ow.object.label("sc2.broadcast().response.result"));
        ow(resp.result.id, ow.string.label("sc2.broadcast().response.result.id"));
        ow(resp.result.block_num, ow.number.label("sc2.broadcast().response.result.block_num"));
        ow(resp.result.trx_num, ow.number.label("sc2.broadcast().response.result"));

        const result: { id: string; block_num: number; trx_num: number } = resp.result;
        return result;
    }

    public async revokeToken(accessToken: string): Promise<any> {
        ow(accessToken, ow.string.nonEmpty.label("accessToken"));

        const sc2Instance = this.constructSC2([]);
        sc2Instance.setAccessToken(accessToken);
        return await new Promise<any>((resolve, reject) => {
            sc2Instance.revokeToken((error, revokeResult) => {
                if (error) reject(this.transformSC2Error(error));
                else resolve(revokeResult);
            });
        });
    }

    private constructSC2(scope: string[]): sc2.SteemConnectV2 {
        ow(scope, ow.array.ofType(ow.string).label("scope"));

        return sc2.Initialize({
            app: this.oauth2ClientId,
            callbackURL: this.callbackUrl,
            scope,
        });
    }

    private transformSC2Error<T>(error: any): Error {
        ow(error, ow.object.label("error"));

        if (error.error_description) {
            const err = new Error(
                (error.message ? error.message : "") +
                    ": " +
                    (error.error ? error.error : "") +
                    " " +
                    error.error_description,
            );
            err.name = error.name;
            if (error.error) (err as any).error = error.error;
            if (error.error_description) (err as any).error_description = error.error_description;
            // console.error(err);
            return err;
        } else return error;
    }
}

export namespace Steemconnect {
    export interface Me {
        account: AccountInfo;
        user_metadata?: any;
        scope: string[];
        name: string;
    }

    export interface BroadcastResult {
        id: string;
        block_num: number;
        trx_num: number;
    }

    export namespace BroadcastResult {
        export function isBroadcastResult(o: any): o is BroadcastResult {
            return (
                (o as BroadcastResult).id !== undefined &&
                (o as BroadcastResult).block_num !== undefined &&
                (o as BroadcastResult).trx_num !== undefined
            );
        }
    }
}
