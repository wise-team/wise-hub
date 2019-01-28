#!/usr/bin/env bash
set -e # fail on first error
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "${DIR}"
NAME="wise-hub monitoring(run-monitoring.sh)"


if [ -z "${SLACK_WEBHOOK_URL}" ]; then
    echo "$NAME: SLACK_WEBHOOK_URL env is not set"
    exit 1
fi

if [ -z "${WISE_ENVIRONMENT_TYPE}" ]; then
    echo "$NAME: WISE_ENVIRONMENT_TYPE env is not set"
    exit 1
fi

if [ -z "${SLACK_MENTIONS}" ]; then
    echo "$NAME: SLACK_MENTIONS env is not set"
    exit 1
fi

if [ -z "${WISE_HUB_URL}" ]; then
    echo "$NAME: WISE_HUB_URL env is not set"
    exit 1
fi

if [ -z "${FAILURE_NOTIFICATION_INTERVAL_S}" ]; then
    echo "$NAME: FAILURE_NOTIFICATION_INTERVAL_S env is not set"
    exit 1
fi

DATA_VOLUME="hub-monitoring-datavolume"

docker run --rm \
    --name "hub-monitoring" \
    -e "SLACK_WEBHOOK_URL=${SLACK_WEBHOOK_URL}" \
    -e "ENVIRONMENT_TYPE=${WISE_ENVIRONMENT_TYPE}" \
    -e "SLACK_MENTIONS=${SLACK_MENTIONS}" \
    -e "PROJECT_NAME=wise-hub" \
    -e "FAILURE_NOTIFICATION_INTERVAL_S=${FAILURE_NOTIFICATION_INTERVAL_S}" \
    -v "$PWD:/spec" \
    -v "${DATA_VOLUME}:/data" \
    -e "WISE_HUB_URL=${WISE_HUB_URL}" \
    wiseteam/dockerized-mocha-slack-service-monitoring
