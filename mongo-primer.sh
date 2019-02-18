#!/bin/bash
set -o allexport; source mongo.production.env; set +o allexport

ROOT_USER=${MONGO_INITDB_ROOT_USERNAME}
ROOT_PASS=${MONGO_INITDB_ROOT_PASSWORD}

EXPRESS_USER=${MONGODB_EXPRESS_USERNAME}
EXPRESS_PASS=${MONGODB_EXPRESS_PASSWORD}
AGENDA_USER=${MONGODB_AGENDA_USERNAME}
AGENDA_PASS=${MONGODB_AGENDA_PASSWORD}
MODIFY_DB=${MONGODB_DBNAME}
MODIFY_ROLE=${MONGODB_READWRITE_ROLE}
PORT=${MONGODB_PORT}

mongo admin --port $PORT -u $ROOT_USER -p $ROOT_PASS --authenticationDatabase admin --eval "db.createUser({ user: '$EXPRESS_USER', pwd: '$EXPRESS_PASS', roles: [ { role: '$MODIFY_ROLE', db: '$MODIFY_DB' } ] });"
mongo admin --port $PORT -u $ROOT_USER -p $ROOT_PASS --authenticationDatabase admin --eval "db.createUser({ user: '$AGENDA_USER', pwd: '$AGENDA_PASS', roles: [ { role: '$MODIFY_ROLE', db: '$MODIFY_DB' } ] });"