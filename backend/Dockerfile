FROM node:latest
WORKDIR /app

COPY package*.json .

RUN npm i

COPY . .

RUN npx tsc

CMD npm start