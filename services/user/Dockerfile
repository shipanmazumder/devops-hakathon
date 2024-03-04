# syntax=docker/dockerfile:1.4

FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app
COPY package.json /usr/src/app/package.json
COPY package-lock.json /usr/src/app/package-lock.json
RUN npm ci

COPY . /usr/src/app

EXPOSE 4000

CMD [ "npm", "start" ]