#!/usr/bin/env bash
set -e # fail on first error
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )" # parent dir of scripts dir
cd "${DIR}"

VAULT_ADDR="http://127.0.0.1:8200"

docker run --net=host -e 'VAULT_SKIP_VERIFY=1' -v "${PWD}/:/wise-vault:ro" -e "VAULT_ADDR=${VAULT_ADDR}" --cap-add IPC_LOCK -it vault sh
