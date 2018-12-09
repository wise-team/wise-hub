#!/usr/bin/env bash
set -e # fail on first error
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/.." # parent dir of scripts dir
cd "${DIR}"

echo "Docker stack deploy:"

docker stack deploy -c stack/stack.yml -c stack/stack.production.yml hub
