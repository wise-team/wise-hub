#!/usr/bin/env bash
set -e # fail on first error
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )/.." # go to parent dir
cd "${DIR}"


#§ 'IMAGE="node:' + data.config.npm.node.version + '-slim"'
IMAGE="node:10.12-slim"

docker run \
  -w "/app" \
  -v "${PWD}:/app" \
  "${IMAGE}" sh -c "npm install && npm run build-production"
