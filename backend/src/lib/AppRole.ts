import { Vault } from "../lib/vault/Vault";
import * as fs from "fs";

export class AppRole {
    public static async login(vault: Vault, requiredPolicies: string []) {
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
    }
}