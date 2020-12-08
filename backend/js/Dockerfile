FROM node:14-alpine

# Where all the magic happens...
WORKDIR /usr/src/app

# Copies all dependency definition
COPY package.json package-lock.json ./

# Install production dependencies
RUN npm install --only=prod

# Copies all sources
COPY . .

# Server default port
EXPOSE 8080

# Should start the server with node
ENTRYPOINT ["npm", "start"]
