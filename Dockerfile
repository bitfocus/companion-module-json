FROM node:18-bookworm AS build

# RUN yarn config set network-timeout 100000 -g
# RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app
RUN chown -R node:node /home/node/app

RUN corepack enable

USER node
COPY --chown=node:node . .

RUN yarn
RUN yarn build
RUN yarn workspaces focus --production

RUN rm -rf .git

FROM node:18-bookworm-slim
COPY --from=build /home/node/app /home/node/app

RUN apt-get update && apt-get install -y \
    git \
    && rm -rf /var/lib/apt/lists/*

# force certain libs to be found by modules
RUN npm install -g rimraf

WORKDIR /home/node/app
CMD [ "node", "./build/main.js" ]
