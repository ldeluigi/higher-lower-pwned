# Dockerfile for hlp-frontend
FROM node:14-alpine AS builder

WORKDIR /usr/src/app

# Install dependencies
COPY frontend/angular/hlp/package.json frontend/angular/hlp/package-lock.json ./
RUN npm install

# Load sources
COPY frontend/angular/hlp/ .

# Angular compilation for production
RUN npm run build-prod

# Production image
FROM nginx:1.19-alpine

# Nginx configurations
COPY nginx/nginx.conf /etc/nginx/nginx.conf

# Upload compiled static files
COPY --from=builder /usr/src/app/dist/hlp/ /usr/src/app/public/
