FROM node:18-alpine

WORKDIR /app

RUN apk update && apk upgrade
RUN apk add git

COPY ../package*.json /app/

RUN npm install -j2 && npm cache clean --force

COPY ../ .

EXPOSE ${NUXT_PORT}

ENV PATH ./node_modules/.bin/:$PATH
