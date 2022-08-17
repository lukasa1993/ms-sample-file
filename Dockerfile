FROM node:16-alpine as base

ADD ./ /opt/app
WORKDIR /opt/app

# for node-pg-native
RUN apk --no-cache add make gcc postgresql-dev g++ bash curl && rm -rf /var/cache/apk/*
RUN npm ci

FROM node:16-alpine as release
WORKDIR /opt/app
COPY --from=base /opt/app /opt/app

ENTRYPOINT sh -c "export POSTGRES_PASSWORD=$(cat /run/secrets/POSTGRES_PASSWORD_FILE) && export POSTGRES_CA='$(cat /run/secrets/POSTGRES_CA)' && node node_modules/db-migrate/bin/db-migrate up && node notify.js"
