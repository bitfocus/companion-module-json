FROM node:14-bullseye
RUN apt-get update && apt-get install -y \
    libusb-1.0-0-dev \
    libudev-dev \
    unzip \
    cmake \
    && rm -rf /var/lib/apt/lists/*
RUN yarn config set network-timeout 100000 -g
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app
COPY package*.json ./
USER node
RUN yarn
COPY --chown=node:node . .
RUN yarn build
CMD [ "node", "./build/main.js" ]
