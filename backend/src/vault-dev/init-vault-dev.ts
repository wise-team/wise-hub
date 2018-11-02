import { Vault } from "../lib/vault/Vault";
import Axios from "axios";
import { d } from "../lib/util";
import { policies } from "./policies";
import { roles } from "./roles";
import * as fs from "fs";
import { Log } from "../lib/Log";

Log.log().initialize();

async function run() {
    const vaultAddr = process.env.WISE_VAULT_URL;
    if (!vaultAddr) throw new Error("Env WISE_VAULT_URL does not exist.");

    const vault = new Vault(vaultAddr);

    console.log("Vault client in dev mode. Populating vault.");


    // init dev server
    console.log("Initialise vault (/v1/sys/init)");
    const initResp = await Axios.post(vaultAddr + "/v1/sys/init", { secret_shares: 1, secret_threshold: 1 });
    const rootToken = d(initResp.data.root_token);
    const unsealKeyBase64 = d(initResp.data.keys_base64[0]);

    console.log("VAULT_ROOT_TOKEN=\"" + rootToken + "\"");
    console.log("Enter this vault:");
    console.log("$ docker exec -it vault-dev sh -c \"vault login " + rootToken + " && sh\"");


    // unseal
    console.log("Unseal vault (/v1/sys/unseal)");
    const unsealResp = await vault.call("POST", "/v1/sys/unseal", { key: unsealKeyBase64 }, rootToken);
    if (d(unsealResp.data.sealed) === true) throw new Error("Unseal did not succeed. Maybe this is not a dev server?");


    // create all policies
    for (let i = 0; i < policies.length; i++) {
        const policy = policies[i];
        console.log("Create policy " + policy.name);
        const writePolicyResp = await vault.call("PUT", "/v1/sys/policy/" + policy.name, { policy: policy.policy }, rootToken);
    }

    // enable AppRole auth
    console.log("Enable AppRole auth");
    const appRoleResp = await vault.call("POST", "/v1/sys/auth/approle", { type: "approle" }, rootToken);

    for (let i = 0; i < roles.length; i++) {
        const role = roles[i];

        // create AppRole role for this app
        console.log("Create role for wise hub backend");
        const createRoleResp = await vault.call("POST", "/v1/auth/approle/role/" + role.role, { policies: role.policies }, rootToken);
        const getRoleIdResp = await vault.call("GET", "/v1/auth/approle/role/" + role.role + "/role-id", undefined, rootToken);
        const roleId = d(getRoleIdResp.data.data.role_id);

        // create secret for this role
        console.log("Create secret for this role");
        const createRoleSecret = await vault.call("POST", "/v1/auth/approle/role/"  + role.role + "/secret-id", {}, rootToken);
        const roleSecret = d(createRoleSecret.data.data.secret_id);

        await vault.login(role.role, role.policies, roleId, roleSecret);
        fs.writeFileSync(role.secretMount, JSON.stringify({ role_name: role.role, role_id: roleId, secret_id: roleSecret }), "UTF-8");
    }

    console.log("Create secret");
    await vault.setSecret("/hub/public/status", { "login_time": new Date().toISOString() });

    console.log("Vault dev mode init done");
}

(async () => {
    try {
        await run();
    }
    catch (error) {
        console.error(error);
        process.exit(1);
    }
})();