FROM node:14-alpine

RUN apk add --update g++ make py3-pip git && rm -rf /var/cache/apk/*

USER root

WORKDIR /usr/src/app

RUN mkdir ./packages

RUN for app in alignment \audio \charts \controller \html \images \maps \networks \pdf \qrcode \replicator \svg \videos \webrtc \whiteboard; do mkdir "./packages/ove-app-$app"; done

COPY ./packages/ove-app-alignment/package.json ./packages/ove-app-alignment
COPY ./packages/ove-app-audio/package.json ./packages/ove-app-audio
COPY ./packages/ove-app-charts/package.json ./packages/ove-app-charts
COPY ./packages/ove-app-controller/package.json ./packages/ove-app-controller
COPY ./packages/ove-app-html/package.json ./packages/ove-app-html
COPY ./packages/ove-app-images/package.json ./packages/ove-app-images
COPY ./packages/ove-app-maps/package.json ./packages/ove-app-maps
COPY ./packages/ove-app-networks/package.json ./packages/ove-app-networks
COPY ./packages/ove-app-pdf/package.json ./packages/ove-app-pdf
COPY ./packages/ove-app-qrcode/package.json ./packages/ove-app-qrcode
COPY ./packages/ove-app-replicator/package.json ./packages/ove-app-replicator
COPY ./packages/ove-app-svg/package.json ./packages/ove-app-svg
COPY ./packages/ove-app-videos/package.json ./packages/ove-app-videos
COPY ./packages/ove-app-webrtc/package.json ./packages/ove-app-webrtc
COPY ./packages/ove-app-whiteboard/package.json ./packages/ove-app-whiteboard

RUN npm --global config set user root

RUN npm install -global pm2
RUN npm install -global lerna@4.0.0

COPY package.json lerna.json ./

RUN npm run install:prod

COPY . .

RUN npm uninstall -global lerna
RUN apk del git g++ make py3-pip

EXPOSE 8081-8095

CMD [ "pm2-runtime", "pm2.json" ]

