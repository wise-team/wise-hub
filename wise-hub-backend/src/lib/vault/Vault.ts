import Axios, { AxiosResponse, AxiosRequestConfig } from "axios";
import { d } from "../util";
import { Log } from "../Log";
import { devWiseHubPolicy } from "./dev-wise-hub-policy";

export class Vault {
    private static ROLE_NAME: string = "wise-hub";
    private static BACKEND_POLICY_NAME: string = "wise-hub-backend-policy";

    private vaultAddr: string;
    private devMode: boolean;
    // TODO protect token variable (ensure this in only in-memory, no swap)
    private token: string = "";
    private tokenLeaseUntil: number = 0;

    public constructor(vaultAddr: string, devMode: boolean) {
        this.vaultAddr = vaultAddr;
        this.devMode = devMode;
    }

    public async init() {
        await this.populateDevVault();
    }

    public async login(roleId: string, roleSecret: string) {
        Log.log().debug("Login with role");
        const loginResp = await Axios.post(this.vaultAddr + "/v1/auth/approle/login",
        { role_id: roleId, secret_id: roleSecret });

        if (loginResp.data.auth.metadata.role_name !== Vault.ROLE_NAME)
            throw new Error("This AppRole is not " + Vault.ROLE_NAME + ", instead logged in as "
                                                            + loginResp.data.auth.metadata.role_name);

        if (loginResp.data.auth.policies.indexOf(Vault.BACKEND_POLICY_NAME) < 0)
            throw new Error("This AppRole does not have " + Vault.BACKEND_POLICY_NAME + " policy.");

        if (loginResp.data.auth.policies.indexOf(Vault.BACKEND_POLICY_NAME) < 0)
            throw new Error("This AppRole does not have " + Vault.BACKEND_POLICY_NAME + " policy.");

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

    private async populateDevVault() {
        Log.log().info("Vault client in dev mode. Populating vault.");

        // init dev server
        Log.log().debug("Initialise vault (/v1/sys/init)");
        const initResp = await Axios.post(this.vaultAddr + "/v1/sys/init", { secret_shares: 1, secret_threshold: 1 });
        const rootToken = d(initResp.data.root_token);
        const unsealKeyBase64 = d(initResp.data.keys_base64[0]);

        Log.log().info("VAULT_ROOT_TOKEN=\"" + rootToken + "\"");
        Log.log().info("Enter this vault:");
        Log.log().info("$ docker exec -it vault-dev sh -c \"vault login " + rootToken + " && sh\"");

        // unseal
        Log.log().debug("Unseal vault (/v1/sys/unseal)");
        const unsealResp = await this.call("POST", "/v1/sys/unseal", { key: unsealKeyBase64 }, rootToken);
        if (d(unsealResp.data.sealed) === true) throw new Error("Unseal did not succeed. Maybe this is not a dev server?");

        // create wise-hub-backend policy
        Log.log().debug("Create " + Vault.BACKEND_POLICY_NAME + " policy (/sys/policy/" + Vault.BACKEND_POLICY_NAME + ")");

        const writePolicyResp = await this.call("PUT", "/v1/sys/policy/" + Vault.BACKEND_POLICY_NAME, { policy: devWiseHubPolicy }, rootToken);
        // Log.log().cheapDebug(() => "Create policy resp: " + JSON.stringify(writePolicyResp, undefined, 2));

        // enable AppRole auth
        Log.log().debug("Enable AppRole auth");
        const appRoleResp = await this.call("POST", "/v1/sys/auth/approle", { type: "approle" }, rootToken);

        // create AppRole role for this app
        Log.log().debug("Create role for wise hub backend");
        const createRoleResp = await this.call("POST", "/v1/auth/approle/role/" + Vault.ROLE_NAME, { policies: [ Vault.BACKEND_POLICY_NAME ] }, rootToken);
        const getRoleIdResp = await this.call("GET", "/v1/auth/approle/role/" + Vault.ROLE_NAME + "/role-id", undefined, rootToken);
        const roleId = d(getRoleIdResp.data.data.role_id);

        // create secret for this role
        Log.log().debug("Create secret for this role");
        const createRoleSecret = await this.call("POST", "/v1/auth/approle/role/"  + Vault.ROLE_NAME + "/secret-id", {}, rootToken);
        const roleSecret = d(createRoleSecret.data.data.secret_id);


        await this.login(roleId, roleSecret);

        Log.log().debug("Create secret");
        await this.setSecret("/hub/public/status", { "login_time": new Date().toISOString() });

        Log.log().info("Vault dev mode init done");
    }
}