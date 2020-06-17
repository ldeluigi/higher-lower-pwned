FROM node:14-alpine

WORKDIR /usr/src/app

COPY . .

RUN npm install --only=prod

EXPOSE 8080

CMD ["npm", "start"]
