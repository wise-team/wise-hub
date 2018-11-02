export const policies: { name: string; policy: string; } [] = [
    /*§ "\n" + data.config.vault.policies(data.config).map(policy => "    { name: \"" + policy.name + "\", policy: `\n" + policy.policy +  "`},\n").reduce((prev, current) => prev + current) §*/
    { name: "wise-hub-api", policy: `

                    # Manage hub/public secrets
                    path "secret/hub/public/*"
                    {
                      capabilities = ["create", "read", "update", "delete", "list"]
                    }
                    `},
    { name: "wise-hub-daemon", policy: `

                    # Manage hub/public secrets
                    path "secret/hub/public/*"
                    {
                      capabilities = ["create", "read", "update", "delete", "list"]
                    }
                    `},
/*§ §.*/
];