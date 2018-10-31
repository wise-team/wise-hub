
/*export const devWiseHubPolicy = {
  policy: {
    name: "wise-hub-backend-policy",
    path: {
      /*"secret/steemconnect/app/*": {
        capabilities: [ "read" ]
      },
      "secret/hub/private/*": {
        capabilities: [ "read", "list" ]
      },* /
      "secret/hub/public/*": {
        capabilities: [ "create", "read", "update", "delete", "list" ]
      },
      /*"secret/steemconnect/users/*": {
        capabilities: [ "create", "read", "update", "delete", "list" ]
      },* /
    }
  }
};*/

export const devWiseHubPolicy = `
# Read steemconnect/app secrets
path "secret/steemconnect/app/*"
{
  capabilities = ["read"]
}

# Read hub/private secrets
path "secret/hub/private/*"
{
  capabilities = ["read", "list"]
}

# Manage hub/public secrets
path "secret/hub/public/*"
{
  capabilities = ["create", "read", "update", "delete", "list"]
}

# Manage steemconnect users
path "secret/steemconnect/users/*"
{
  capabilities = ["create", "read", "update", "delete", "list"]
}
`;
