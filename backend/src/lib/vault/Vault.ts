import Axios, { AxiosResponse, AxiosRequestConfig } from "axios";
import { Log } from "../Log";
import ow from "ow";
import * as _ from "lodash";

export function d <T> (input: T | undefined): T {
    if (typeof input !== "undefined") return input;
    else throw new Error("Input value is undefined (d() fn)");
}

export class Vault {
    private vaultAddr: string;
    // TODO protect token variable (ensure this in only in-memory, no swap)
    private token: string = "";
    private tokenLeaseUntil: number = 0;
    private loginCallback: (vault: Vault) => Promise<any> = async () => {};

    public constructor(vaultAddr: string) {
        ow(vaultAddr, ow.string.startsWith("http").label("vaultAddr"));

        this.vaultAddr = vaultAddr;
    }

    public async init(loginCallback: (vault: Vault) => Promise<any>) {
        ow(loginCallback, ow.function.label("loginCallback"));

        this.loginCallback = loginCallback;

        try {
            const status = await this.getStatus();
            if (!status.initialized) Log.log().warn("Warning: vault is not initialized. Login will fail");
            if (!!status.sealed) Log.log().warn("Warning: vault is sealed. Login will fail");

            await this.loginCallback(this);
        }
        catch (error) {
            throw new Error("Vault.init(): Could not get health status of the vault. Please check the connecrtion. Error: " + error);
        }
    }

    public isLoggedIn(): boolean {
        return this.token.length > 0;
    }

    public async call(
        method: "GET" | "POST" | "PUT" | "DELETE" | "LIST",
        path: string, data: any, token: string | undefined = this.token, authorized: boolean = true
    ): Promise<AxiosResponse> {
        ow(method, ow.string.label("method").oneOf([ "GET", "POST", "PUT", "DELETE", "LIST" ]));
        ow(path, ow.string.label("path").startsWith("/"));
        // do not validate token with 'ow': validation error could accidentally print the token
        ow(authorized, ow.boolean.label("authorized"));


        if (authorized && !token) throw new Error("Token is not set. Vault client is unauthorized.");

        const headers: _.Dictionary<string> = {};
        if (authorized) headers["X-Vault-Token"] = token;
        return this.errorTransformer("call " + path, async () => {
            return await Axios({
                method: method,
                url: this.vaultAddr + path,
                data: data,
                headers: headers
            });
        });
    }

    public async userPassLogin(username: string, password: string, requiredPolicies: string []) {
        const loginResp = await this.call("POST", "/v1/auth/userpass/login/" + username,
            { password: password }, undefined, false);

        requiredPolicies.forEach(requiredPolicy => {
            if (loginResp.data.auth.policies.indexOf(requiredPolicy) < 0)
                throw new Error("This AppRole does not have " + requiredPolicy + " policy.");
        });

        if (!loginResp.data.auth.renewable)
            throw new Error("Got token that is not renewable!");

        const leaseDurationS = d(loginResp.data.auth.lease_duration);
        this.renewTokenIn(Math.round(leaseDurationS * 1000 * 2 / 3), leaseDurationS);

        this.token = d(loginResp.data.auth.client_token);
        this.tokenLeaseUntil = Date.now() / 1000 + leaseDurationS;
    }

    public async appRoleLogin(roleName: string, requiredPolicies: string [], roleId: string, roleSecret: string) {
        const loginResp = await this.call("POST", "/v1/auth/approle/login",
        { role_id: roleId, secret_id: roleSecret }, undefined, false);

        if (loginResp.data.auth.metadata.role_name !== roleName)
            throw new Error("This AppRole is not " + roleName + ", instead logged in as "
                                                            + loginResp.data.auth.metadata.role_name);

        requiredPolicies.forEach(requiredPolicy => {
            if (loginResp.data.auth.policies.indexOf(requiredPolicy) < 0)
                throw new Error("This AppRole does not have " + requiredPolicy + " policy.");
        });

        if (!loginResp.data.auth.renewable)
            throw new Error("Got token that is not renewable!");

        const leaseDurationS = d(loginResp.data.auth.lease_duration);
        this.renewTokenIn(Math.round(leaseDurationS * 1000 * 2 / 3), leaseDurationS);

        this.token = d(loginResp.data.auth.client_token);
        this.tokenLeaseUntil = Date.now() / 1000 + leaseDurationS;
    }

    public async getStatus(): Promise<any> {
        let resp;
        try {
            resp = this.call("GET", "/v1/sys/health", undefined, undefined, false);
        }
        catch (error) {
            resp = error.response;
            if (!error.response || !error.response.status || ![200, 429, 472, 473, 501, 503].indexOf(error.response.status)) {
                throw error;
            }
        }
        return resp.data;
    }

    public async getSecret(secretPath: string): Promise<any> {
        try {
            if (secretPath.substring(0, 1) !== "/") throw new Error("Secret path must start with \"/\"");
            const resp =  await this.call("GET", "/v1/secret" + secretPath, {});
            return d(resp.data.data);
        }
        catch (error) {
            if (error.response && error.response.status && error.response.status === 404) return undefined;
            else throw error;
        }
    }

    public async setSecret(secretPath: string, secret: any) {
        if (secretPath.substring(0, 1) !== "/") throw new Error("Secret path must start with \"/\"");
        const resp =  await this.call("PUT", "/v1/secret" + secretPath, secret);
        if (!resp || !resp.status || resp.status !== 204) throw new Error("Error while setting the secret. Status is not 204");
    }

    public async deleteSecret(secretPath: string) {
        if (secretPath.substring(0, 1) !== "/") throw new Error("Secret path must start with \"/\"");
        const resp =  await this.call("DELETE", "/v1/secret" + secretPath, undefined);
        if (!resp || !resp.status || resp.status !== 204) throw new Error("Error while deleting the secret. Status is not 204");
    }

    public async initVault(opts: { secret_shares: number, secret_threshold: number }): Promise<{ root_token: string, keys: string [], keys_base64: string [] }> {
        const resp: AxiosResponse<any> = await this.call("POST", "/v1/sys/init",
        { secret_shares: opts.secret_shares, secret_threshold: opts.secret_threshold }, undefined, false);
        this.token = d(resp.data.root_token);
        return d(resp.data);
    }

    public async unseal(key: string) {
        await this.call("POST", "/v1/sys/unseal",
        { key: key }, undefined, false);
    }

    public async seal() {
        await this.call("POST", "/v1/sys/seal", undefined);
    }

    public async putPolicy(policyName: string, policyHcl: string) {
        await this.call("PUT", "/v1/sys/policy/" + policyName, { policy: policyHcl });
    }

    public async enableAuthMethod(method: string, description: string, config: {}) {
        await this.call("POST", "/v1/sys/auth/" + method, { type: method, description: description, config: config });
    }

    public async createUserpassUser(username: string, password: string, policies: string []) {
        await this.call("POST", "/v1/auth/userpass/users/" + username, { password: password, policies: policies.join(",") });
    }

    public async createAppRoleRole(roleName: string, policies: string []) {
        await this.call("POST", "/v1/auth/approle/role/" + roleName, { policies: policies });
    }

    public async getAppRoleId(roleName: string): Promise<string> {
        const resp = await this.call("GET", "/v1/auth/approle/role/" + roleName + "/role-id", undefined);
        return d(resp.data.data.role_id);
    }

    public async generateAppRoleSecretId(roleName: string, metadata: any): Promise<string> {
        const resp = await this.call("POST", "/v1/auth/approle/role/"  + roleName + "/secret-id", { metadata: JSON.stringify(metadata) });
        return d(resp.data.data.secret_id);
    }

    public async revokeSelf() {
        await this.call("POST", "/v1/auth/token/revoke-self", undefined);
    }

    public async revokeToken(token: string) {
        await this.call("POST", "/v1/auth/token/revoke", { token: token });
    }

    private renewTokenIn(waitTimeMs: number, incrementS: number) {
        Log.log().debug("Renewing vault token in " + (waitTimeMs / 1000) + "s");
        setTimeout(() => {
            (async () => {
                try {
                    const resp = await this.call("POST", "/v1/auth/token/renew-self", { increment: incrementS });
                    this.token = d(resp.data.auth.client_token);
                    const leaseDurationS = d(resp.data.auth.lease_duration);

                    if (leaseDurationS > 240) {
                        const nextRenewAfterMs = Math.round(leaseDurationS * 1000 * 2 / 3);
                        Log.log().debug("Vault token renewed. Valid for " + leaseDurationS + " seconds (until: "
                                + (new Date(Date.now() + leaseDurationS * 1000).toISOString()) + " Next renew after " + nextRenewAfterMs + "ms");
                        this.renewTokenIn(nextRenewAfterMs, incrementS);
                    }
                    else {
                        Log.log().debug("Vault token renewed. Valid for " + leaseDurationS + " seconds (until: "
                                + (new Date(Date.now() + leaseDurationS * 1000).toISOString()) + " Lease duration is below the threshold. Performing login.");
                        await this.loginCallback(this);
                    }
                }
                catch (error) {
                    Log.log().error("Vault: Error while trying to renew token: " + error + ". Trying to renew in 30 seconds.");
                    this.renewTokenIn(30 * 1000, incrementS);
                }
            })();
        }, waitTimeMs);
    }

    private async errorTransformer<T>(where: string, fn: () => Promise<T>): Promise<T> {
        try {
            return await fn();
        }
        catch (error) {
            if (error.response || error.request) { // do not log full responses or requests for security reason
                const errorDescriptors: string [] = _.get(error, "response.data.errors", []);
                const msg = "Vault error: " + error.name + ", message: " + error.message + ", error descriptors: " + JSON.stringify(errorDescriptors);
                const errObject: any = new Error(msg);
                errObject.vault = true;
                errObject.errors = errorDescriptors;
                errObject.response.status = _.get(error, "response.status", 0);

                throw errObject;
            }
            else throw error;
        }
    }
}