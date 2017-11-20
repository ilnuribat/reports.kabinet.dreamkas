FROM node:8

COPY . /app
COPY .env-production /app/.env

WORKDIR /app

RUN npm install

EXPOSE 8080

CMD npm start
