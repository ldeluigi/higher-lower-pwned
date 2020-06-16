FROM node:14-alpine AS builder

WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm install

COPY . .

RUN npm run build --prod


FROM nginx:1.19-alpine

COPY nginx/ /etc/nginx/
COPY --from=builder /usr/src/app/dist/higher-lower-pwned/ /usr/src/app/html/
