FROM node:alpine

RUN apk add --no-cache git yarn ca-certificates

RUN mkdir -p /app
WORKDIR /app

COPY package*.json /app/
COPY yarn.lock /app/
RUN yarn --pure-lockfile

COPY . /app

EXPOSE 4000
CMD [ "yarn", "run", "start:prod" ]
