#!/usr/bin/env bash
set -e # fail on first error
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )" # parent dir of scripts dir
cd "${DIR}"


JQ="jq"
VAULT_ADDR="http://127.0.0.1:8200"
# USERPASS_USERNAME=""
# USERPASS_PASS=""
SECRETS_PATH="/run/wise/secrets"

mkdir -p ${SECRETS_PATH}

TOKEN=$(curl -s \
    --request POST \
    --data "{\"password\":\"${USERPASS_PASS}\"}" \
    http://127.0.0.1:8200/v1/auth/userpass/login/${USERPASS_USERNAME} | ${JQ} --raw-output .auth.client_token)


#§ 'API_ROLE_NAME="' + data.config.hub.docker.services.api.appRole.role + '"'
API_ROLE_NAME="wise-hub-api"
#§ 'SECRETNAME_API_ROLE_ID="' + data.config.hub.docker.services.api.secrets.appRoleId + '"'
SECRETNAME_API_ROLE_ID="hub-api-approle-id"
#§ 'SECRETNAME_API_ROLE_SECRET="' + data.config.hub.docker.services.api.secrets.appRoleSecret + '"'
SECRETNAME_API_ROLE_SECRET="hub-api-approle-secret"

#§ 'PUBLISHER_ROLE_NAME="' + data.config.hub.docker.services.publisher.appRole.role + '"'
PUBLISHER_ROLE_NAME="wise-hub-daemon"
#§ 'SECRETNAME_PUBLISHER_ROLE_ID="' + data.config.hub.docker.services.publisher.secrets.appRoleId + '"'
SECRETNAME_PUBLISHER_ROLE_ID="hub-publisher-approle-id"
#§ 'SECRETNAME_PUBLISHER_ROLE_SECRET="' + data.config.hub.docker.services.publisher.secrets.appRoleSecret + '"'
SECRETNAME_PUBLISHER_ROLE_SECRET="hub-publisher-approle-secret"




API_ROLE_ID=$(curl -s \
    --header "X-Vault-Token: ${TOKEN}" \
    http://127.0.0.1:8200/v1/auth/approle/role/$API_ROLE_NAME/role-id | ${JQ} --raw-output .data.role_id)

if [ -e "${SECRETS_PATH}/${SECRETNAME_API_ROLE_SECRET}" ]; then 
    OLD_SECRET_ID=$(<${SECRETS_PATH}/${SECRETNAME_API_ROLE_SECRET})
    curl --fail \
        --header "X-Vault-Token: ${TOKEN}" \
        --data "{\"secret_id\":\"aa${OLD_SECRET_ID}j\"}" \
        http://127.0.0.1:8200/v1/auth/approle/role/$API_ROLE_NAME/secret-id/destroy
    echo "Destroyed token ${OLD_SECRET_ID}"
fi

API_SECRET_ID=$(curl -s \
    --header "X-Vault-Token: ${TOKEN}" \
    --data "{\"metadata\":\"generator=install-secrets\"}" \
    http://127.0.0.1:8200/v1/auth/approle/role/$API_ROLE_NAME/secret-id | ${JQ} --raw-output .data.secret_id)

printf "${API_ROLE_ID}" > "${SECRETS_PATH}/${SECRETNAME_API_ROLE_ID}"
printf "${API_SECRET_ID}" > "${SECRETS_PATH}/${SECRETNAME_API_ROLE_SECRET}"




PUBLISHER_ROLE_ID=$(curl -s \
    --header "X-Vault-Token: ${TOKEN}" \
    http://127.0.0.1:8200/v1/auth/approle/role/$PUBLISHER_ROLE_NAME/role-id | ${JQ} --raw-output .data.role_id)

if [ -e "${SECRETS_PATH}/${SECRETNAME_PUBLISHER_ROLE_SECRET}" ]; then 
    OLD_SECRET_ID=$(<${SECRETS_PATH}/${SECRETNAME_PUBLISHER_ROLE_SECRET})
    curl --fail \
        --header "X-Vault-Token: ${TOKEN}" \
        --data "{\"secret_id\":\"aa${OLD_SECRET_ID}j\"}" \
        http://127.0.0.1:8200/v1/auth/approle/role/$PUBLISHER_ROLE_NAME/secret-id/destroy
    echo "Destroyed token ${OLD_SECRET_ID}"
fi

PUBLISHER_SECRET_ID=$(curl -s \
    --header "X-Vault-Token: ${TOKEN}" \
    --data "{\"metadata\":\"generator=install-secrets\"}" \
    http://127.0.0.1:8200/v1/auth/approle/role/$PUBLISHER_ROLE_NAME/secret-id | ${JQ} --raw-output .data.secret_id)

printf "${PUBLISHER_ROLE_ID}" > "${SECRETS_PATH}/${SECRETNAME_PUBLISHER_ROLE_ID}"
printf "${PUBLISHER_SECRET_ID}" > "${SECRETS_PATH}/${SECRETNAME_PUBLISHER_ROLE_SECRET}"
