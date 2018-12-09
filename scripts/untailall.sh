#!/usr/bin/env bash
set -e # fail on first error

pkill -f 'docker service logs'

echo "Stopped tail"