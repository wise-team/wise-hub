#!/usr/bin/env bash
set -e # fail on first error
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "${DIR}"

#§ 'IMAGE_NAME="' + data.config.hub.docker.images.backend.name + '"'
IMAGE_NAME="wise/hub-backend"

docker build --no-cache -t $IMAGE_NAME .
