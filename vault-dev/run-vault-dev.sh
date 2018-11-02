#!/usr/bin/env bash
set -e # fail on first error
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )" # parent dir of scripts dir
cd "${DIR}"

docker network rm vault-net | echo ""
docker network create vault-net

docker-compose down
docker-compose up -d

VAULT_ADDR="http://127.0.0.1:8200"
INIT_FILE="../../secret-vault-dev/vault-dev-config.json"

UNSEAL_KEY_1=`node -e "console.log(require(\"${INIT_FILE}\").unseal.keys_base64[0])"`
UNSEAL_KEY_2=`node -e "console.log(require(\"${INIT_FILE}\").unseal.keys_base64[1])"`

API_ROLE_ID=`node -e "console.log(require(\"${INIT_FILE}\").appRoles[0].role_id)"`
API_ROLE_SECRET=`node -e "console.log(require(\"${INIT_FILE}\").appRoles[0].secret_id)"`
DAEMON_ROLE_ID=`node -e "console.log(require(\"${INIT_FILE}\").appRoles[1].role_id)"`
DAEMON_ROLE_SECRET=`node -e "console.log(require(\"${INIT_FILE}\").appRoles[1].secret_id)"`

#§ 'SECRETNAME_API_ROLE_ID="' + data.config.hub.docker.services.api.secrets.appRoleId + '"'
SECRETNAME_API_ROLE_ID="hub-api-approle-id"
#§ 'SECRETNAME_API_ROLE_SECRET="' + data.config.hub.docker.services.api.secrets.appRoleSecret + '"'
SECRETNAME_API_ROLE_SECRET="hub-api-approle-secret"
#§ 'SECRETNAME_DAEMON_ROLE_ID="' + data.config.hub.docker.services.daemon.secrets.appRoleId + '"'
SECRETNAME_DAEMON_ROLE_ID="hub-daemon-approle-id"
#§ 'SECRETNAME_DAEMON_ROLE_SECRET="' + data.config.hub.docker.services.daemon.secrets.appRoleSecret + '"'
SECRETNAME_DAEMON_ROLE_SECRET="hub-daemon-approle-secret"


curl \
    --request PUT \
    --data "{ \"key\":\"${UNSEAL_KEY_1}\" }" \
    ${VAULT_ADDR}/v1/sys/unseal

curl \
    --request PUT \
    --data "{ \"key\":\"${UNSEAL_KEY_2}\" }" \
    ${VAULT_ADDR}/v1/sys/unseal

#docker secret rm ${SECRETNAME_API_ROLE_ID} ; echo ""
#docker secret rm ${SECRETNAME_API_ROLE_SECRET} ; echo ""
#docker secret rm ${SECRETNAME_DAEMON_ROLE_ID} ; echo ""
#docker secret rm ${SECRETNAME_DAEMON_ROLE_SECRET} ; echo ""

#echo "${API_ROLE_ID}" | docker secret create ${SECRETNAME_API_ROLE_ID} -
#echo "${API_ROLE_SECRET}" | docker secret create ${SECRETNAME_API_ROLE_SECRET} -
#echo "${DAEMON_ROLE_ID}" | docker secret create ${SECRETNAME_DAEMON_ROLE_ID} -
#echo "${DAEMON_ROLE_SECRET}" | docker secret create ${SECRETNAME_DAEMON_ROLE_SECRET} -

SECRETS_DIR="${DIR}/../secrets"
mkdir -p "${SECRETS_DIR}"
printf "${API_ROLE_ID}" > "${SECRETS_DIR}/${SECRETNAME_API_ROLE_ID}"
printf "${API_ROLE_SECRET}" > "${SECRETS_DIR}/${SECRETNAME_API_ROLE_SECRET}"
printf "${DAEMON_ROLE_ID}" > "${SECRETS_DIR}/${SECRETNAME_DAEMON_ROLE_ID}"
printf "${DAEMON_ROLE_SECRET}" > "${SECRETS_DIR}/${SECRETNAME_DAEMON_ROLE_SECRET}"


echo "Unseal done"

docker attach vault-dev
