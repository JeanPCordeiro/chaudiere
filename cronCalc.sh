#!/bin/sh

scriptPath=$(dirname "$(readlink -f "$0")")
. "${scriptPath}/.env.sh"

# the docker-compose variables should be available here
/usr/local/bin/node /usr/src/app/CalcConsoMySQL.js
