FROM node:latest as BUILD
WORKDIR /app

COPY package*.json .

RUN npm i
RUN npm i -g @angular/cli

COPY . .

CMD npm run build -- --base-href https://budget.theriot.dev.com
