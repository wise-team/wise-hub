import Axios, { AxiosResponse, AxiosRequestConfig } from "axios";
import { d } from "../util";
import { Log } from "../Log";
import { devWiseHubPolicy } from "./dev-wise-hub-policy";

export class Vault {
    private vaultAddr: string;
    // TODO protect token variable (ensure this in only in-memory, no swap)
    private token: string = "";
    private tokenLeaseUntil: number = 0;

    public constructor(vaultAddr: string) {
        this.vaultAddr = vaultAddr;
    }

    public async init() {
    }

    public async login(roleName: string, requiredPolicies: string [], roleId: string, roleSecret: string) {
        Log.log().debug("Login with role");
        const loginResp = await Axios.post(this.vaultAddr + "/v1/auth/approle/login",
        { role_id: roleId, secret_id: roleSecret });

        if (loginResp.data.auth.metadata.role_name !== roleName)
            throw new Error("This AppRole is not " + roleName + ", instead logged in as "
                                                            + loginResp.data.auth.metadata.role_name);

        requiredPolicies.forEach(requiredPolicy => {
            if (loginResp.data.auth.policies.indexOf(requiredPolicy) < 0)
                throw new Error("This AppRole does not have " + requiredPolicy + " policy.");
        });

        if (!loginResp.data.auth.renewable)
            throw new Error("Got token that is not renewable!");

        this.token = d(loginResp.data.auth.client_token);
        this.tokenLeaseUntil = Date.now() / 1000 + d(loginResp.data.auth.lease_duration);
    }

    public async getStatus(): Promise<any> {
        const resp =  await Axios.get(this.vaultAddr + "/v1/sys/health");
        return resp.data;
    }

    public async getSecret(secretPath: string): Promise<any> {
        if (secretPath.substring(0, 1) !== "/") throw new Error("Secret path must start with \"/\"");
        const resp =  await this.call("GET", "/v1/secret" + secretPath, {});
        return d(resp.data.data);
    }

    public async setSecret(secretPath: string, secret: any) {
        if (secretPath.substring(0, 1) !== "/") throw new Error("Secret path must start with \"/\"");
        const resp =  await this.call("PUT", "/v1/secret" + secretPath, secret);
        if (resp.status !== 204) throw new Error("Error while setting the secret. Status is not 204");
    }

    public async deleteSecret(secretPath: string) {
        if (secretPath.substring(0, 1) !== "/") throw new Error("Secret path must start with \"/\"");
        const resp =  await this.call("DELETE", "/v1/secret" + secretPath, {});
        if (resp.status !== 204) throw new Error("Error while deleting the secret. Status is not 204");
    }

    public async call(method: "GET" | "POST" | "PUT" | "DELETE", path: string, data: any, token: string = this.token): Promise<AxiosResponse> {
        if (!token) throw new Error("Token is not set. Vault client is unauthorized.");
        return await Axios({
            method: method,
            url: this.vaultAddr + path,
            data: data,
            headers: {
                "X-Vault-Token": token
            }
        });
    }
}