FROM node:14-alpine

# Where all the magic happens...
WORKDIR /usr/src/app

# Copies all source files to destination
COPY . .

# Install production dependencies
RUN npm install --only=prod

# Server default port
EXPOSE 8080

# Should start the server with node
ENTRYPOINT ["npm", "start"]
