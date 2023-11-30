FROM node:18-bookworm-slim

RUN apt-get update && apt-get install -y \
    git \
    && rm -rf /var/lib/apt/lists/*

RUN yarn config set network-timeout 100000 -g
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app
COPY package*.json yarn.lock ./

USER node
RUN yarn

COPY --chown=node:node . .
RUN yarn build

CMD [ "node", "./build/main.js" ]
