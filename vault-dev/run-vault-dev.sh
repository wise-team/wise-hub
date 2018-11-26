#!/usr/bin/env bash
set -e # fail on first error
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )" # parent dir of scripts dir
cd "${DIR}"

docker-compose down

docker network rm vault-net || echo "Not removed previous vault-net network"
docker network create \
    --scope=swarm --driver=bridge --internal --attachable \
    vault-net

docker-compose up -d

echo "Sleep 5 for the server to start up"
sleep 5

VAULT_ADDR="http://127.0.0.1:8200"
INIT_FILE="../../secret-vault-dev/vault-dev-config.json"

UNSEAL_KEY_1=`node -e "console.log(require(\"${INIT_FILE}\").unseal.keys_base64[0])"`
UNSEAL_KEY_2=`node -e "console.log(require(\"${INIT_FILE}\").unseal.keys_base64[1])"`

API_ROLE_ID=`node -e "console.log(require(\"${INIT_FILE}\").appRoles[0].role_id)"`
API_ROLE_SECRET=`node -e "console.log(require(\"${INIT_FILE}\").appRoles[0].secret_id)"`
PUBLISHER_ROLE_ID=`node -e "console.log(require(\"${INIT_FILE}\").appRoles[1].role_id)"`
PUBLISHER_ROLE_SECRET=`node -e "console.log(require(\"${INIT_FILE}\").appRoles[1].secret_id)"`

#§ 'SECRETNAME_API_ROLE_ID="' + data.config.hub.docker.services.api.secrets.appRoleId + '"'
SECRETNAME_API_ROLE_ID="hub-api-approle-id"
#§ 'SECRETNAME_API_ROLE_SECRET="' + data.config.hub.docker.services.api.secrets.appRoleSecret + '"'
SECRETNAME_API_ROLE_SECRET="hub-api-approle-secret"
#§ 'SECRETNAME_PUBLISHER_ROLE_ID="' + data.config.hub.docker.services.publisher.secrets.appRoleId + '"'
SECRETNAME_PUBLISHER_ROLE_ID="hub-publisher-approle-id"
#§ 'SECRETNAME_PUBLISHER_ROLE_SECRET="' + data.config.hub.docker.services.publisher.secrets.appRoleSecret + '"'
SECRETNAME_PUBLISHER_ROLE_SECRET="hub-publisher-approle-secret"


curl \
    --request PUT \
    --data "{ \"key\":\"${UNSEAL_KEY_1}\" }" \
    ${VAULT_ADDR}/v1/sys/unseal

curl \
    --request PUT \
    --data "{ \"key\":\"${UNSEAL_KEY_2}\" }" \
    ${VAULT_ADDR}/v1/sys/unseal

echo "Unseal done"
echo "Provisioning docker swarm secrets"

docker secret rm ${SECRETNAME_API_ROLE_ID} || echo "Tried to rm previous secret. The above error is all ok."
docker secret rm ${SECRETNAME_API_ROLE_SECRET} || echo "Tried to rm previous secret. The above error is all ok."
docker secret rm ${SECRETNAME_PUBLISHER_ROLE_ID} || echo "Tried to rm previous secret. The above error is all ok."
docker secret rm ${SECRETNAME_PUBLISHER_ROLE_SECRET} || echo "Tried to rm previous secret. The above error is all ok."

printf "${API_ROLE_ID}" | docker secret create ${SECRETNAME_API_ROLE_ID} -
printf "${API_ROLE_SECRET}" | docker secret create ${SECRETNAME_API_ROLE_SECRET} -
printf "${PUBLISHER_ROLE_ID}" | docker secret create ${SECRETNAME_PUBLISHER_ROLE_ID} -
printf "${PUBLISHER_ROLE_SECRET}" | docker secret create ${SECRETNAME_PUBLISHER_ROLE_SECRET} -

echo "Secret provisioning done"

echo "Testing appRole login as Publisher"

curl \
    --request POST \
    --data "{ \"role_id\":\"${PUBLISHER_ROLE_ID}\",\"secret_id\":\"${PUBLISHER_ROLE_SECRET}\" }" \
    ${VAULT_ADDR}/v1/auth/approle/login

echo "Testing appRole login as API"

curl \
    --request POST \
    --data "{ \"role_id\":\"${API_ROLE_ID}\",\"secret_id\":\"${API_ROLE_SECRET}\" }" \
    ${VAULT_ADDR}/v1/auth/approle/login

echo "Testing done"

#SECRETS_DIR="${DIR}/../secrets"
#mkdir -p "${SECRETS_DIR}"
#printf "${API_ROLE_ID}" > "${SECRETS_DIR}/${SECRETNAME_API_ROLE_ID}"
#printf "${API_ROLE_SECRET}" > "${SECRETS_DIR}/${SECRETNAME_API_ROLE_SECRET}"
#printf "${PUBLISHER_ROLE_ID}" > "${SECRETS_DIR}/${SECRETNAME_PUBLISHER_ROLE_ID}"
#printf "${PUBLISHER_ROLE_SECRET}" > "${SECRETS_DIR}/${SECRETNAME_PUBLISHER_ROLE_SECRET}"




docker attach vault-dev
