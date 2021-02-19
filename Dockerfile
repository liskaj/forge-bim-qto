FROM node:12.20.2-alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY . .
RUN npm install
RUN npm run build:server
RUN npm run build:client

ENV FORGE_CLIENT_ID=default
ENV FORGE_CLIENT_SECRET=default
ENV PORT=3000

EXPOSE ${PORT}

CMD [ "npm", "start"]
