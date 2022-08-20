FROM node:16-alpine as base

ADD ./ /opt/app
WORKDIR /opt/app

RUN npm ci

FROM node:16-alpine as release
WORKDIR /opt/app
COPY --from=base /opt/app /opt/app

ENV HOME_DIR=/opt/app \
	NODE_ENV=production \
	NODE_CONFIG='{"app":{"port":"7702"}}' \
	PORT=7702

RUN mkdir -p /opt/app/config && echo $NODE_CONFIG > /opt/app/config/$NODE_ENV.json

ENTRYPOINT node server.js
