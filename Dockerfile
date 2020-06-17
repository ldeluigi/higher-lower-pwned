# Dockerfile for hlp-frontend
FROM node:14-alpine AS builder

WORKDIR /usr/src/app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Load sources
COPY . .

# Angular compilation for production
RUN npm run build

# Production image
FROM nginx:1.19-alpine

# Nginx configurations
COPY nginx/ /etc/nginx/

# Upload compiled static files
COPY --from=builder /usr/src/app/dist/higher-lower-pwned/ /usr/src/app/public/
