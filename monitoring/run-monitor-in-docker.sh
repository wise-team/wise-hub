#!/usr/bin/env bash
set -e # fail on first error
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "${DIR}"

if [ -z "${SLACK_WEBHOOK_URL}" ]; then
    echo "SLACK_WEBHOOK_URL env is not set"
    exit 1
fi

if [ -z "${WISE_ENVIRONMENT_TYPE}" ]; then
    echo "WISE_ENVIRONMENT_TYPE env is not set"
    exit 1
fi

if [ -z "${SLACK_MENTIONS}" ]; then
    echo "SLACK_MENTIONS env is not set"
    exit 1
fi

if [ -z "${WISE_HUB_URL}" ]; then
    echo "WISE_HUB_URL env is not set"
    exit 1
fi


DATA_VOLUME="hub_monitoring_data"
CONTAINER_NAME="hub-monitoring"
#§ 'IMAGE="node:' + data.config.npm.node.version + '-slim"'
IMAGE="node:10.12-slim"
FAILURE_NOTIFICATION_INTERVAL_S="1800"


docker run --rm\
  --name "${CONTAINER_NAME}" \
  -v "${PWD}:/app" \
  -w /app \
  -e "SLACK_WEBHOOK_URL=${SLACK_WEBHOOK_URL}" \
  -e "WISE_ENVIRONMENT_TYPE=${WISE_ENVIRONMENT_TYPE}" \
  -e "SLACK_MENTIONS=${SLACK_MENTIONS}" \
  -e "WISE_HUB_URL=${WISE_HUB_URL}" \
  -e "FAILURE_NOTIFICATION_INTERVAL_S=${FAILURE_NOTIFICATION_INTERVAL_S}" \
  -v "${DATA_VOLUME}:/data" \
  "${IMAGE}" sh -c "npm install > /dev/null && npm run --silent monitor"
