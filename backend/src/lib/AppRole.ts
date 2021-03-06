import * as BluebirdPromise from "bluebird";
import * as fs from "fs";

import { Vault } from "../lib/vault/Vault";

import { Log } from "./Log";

export class AppRole {
    public static async login(vault: Vault, requiredPolicies: string[]) {
        try {
            Log.log().debug("Performing Vault login. Vault status=" + JSON.stringify(await vault.getStatus()));

            const roleName = process.env.VAULT_APPROLE_NAME;
            if (!roleName) throw new Error("/lib/AppRole: Env VAULT_APPROLE_NAME is missing");

            const idFile = process.env.VAULT_APPROLE_ID_FILE;
            if (!idFile) throw new Error("/lib/AppRole: Env VAULT_APPROLE_ID_FILE is missing");

            const secretFile = process.env.VAULT_APPROLE_SECRET_FILE;
            if (!secretFile) throw new Error("/lib/AppRole: Env VAULT_APPROLE_SECRET_FILE is missing");

            if (!fs.existsSync(idFile)) throw new Error("/lib/AppRole: file " + idFile + " does not exist");
            if (!fs.existsSync(secretFile)) throw new Error("/lib/AppRole: file " + secretFile + " does not exist");

            const id = fs.readFileSync(idFile, "UTF-8");
            const secret = fs.readFileSync(secretFile, "UTF-8");

            await vault.appRoleLogin(roleName, requiredPolicies, id, secret);
        } catch (error) {
            Log.log().error("Error during AppRole login: " + error + ". Waiting 20s before next login attempt.", {
                response: (error as any).response,
            });

            await BluebirdPromise.delay(20 * 1000);

            // try again
            await AppRole.login(vault, requiredPolicies);
        }
    }
}
