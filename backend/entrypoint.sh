#!/usr/bin/env bash
# source: https://github.com/bufferings/docker-access-host/blob/master/docker-entrypoint.sh

echo "begin entrypoint"
HOST_DOMAIN="host.localhost"
ping -q -c1 $HOST_DOMAIN > /dev/null 2>&1

if [ $? -ne 0 ]; then
  set -e
  HOST_IP=$(ip route | awk 'NR==1 {print $3}')
  echo -e "$HOST_IP\t$HOST_DOMAIN" >> /etc/hosts
fi

set -e
ping -q -c1 $HOST_DOMAIN 

exec "$@"