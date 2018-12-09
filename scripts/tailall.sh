#!/usr/bin/env bash
set -e # fail on first error

docker stack services hub --format '{{.Name}}' | for i in `awk '{ print $1 }'`; do docker service logs --follow --tail=30 $i & done

echo "Tail will continut output on this shell. Use scripts/untailall.sh to stop"