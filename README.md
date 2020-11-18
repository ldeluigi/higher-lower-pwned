![Node.js CI](https://github.com/ldeluigi/higher-lower-pwned/workflows/Node.js%20CI/badge.svg)
![Angular CI](https://github.com/ldeluigi/higher-lower-pwned/workflows/Angular%20CI/badge.svg)

# The Pwned Game

This project is a web game where you guess which password is the most popular between two shown on screen.

## Technologies

**Note:** _Versions listed here refer to the one used to build the project, but it should work with the most recent minor version of the same major._

### Needed on the host

- [Angular CLI](https://github.com/angular/angular-cli) version 10.0.6.
- [NodeJS](https://nodejs.org/) version 12.18.0.
- [Docker](https://www.docker.com/) engine version 19.03.1.

### Used in the project

- Nginx
- Nodemon
- NodeJS
- Socket.io
- MongoDB
- Express
- Angular
- Angular Material
- Mongoose
- ...

## Development: server

### Before starting

Please keep in mind that the server needs some enviroment variables to be defined inside an `.env` in the root folder, which could look like:

```
HOST_PORT=9000
JWT_SECRET=yummy
MONGO_DB_NAME=hlp-db
MONGO_DB_USERNAME=hlp
MONGO_DB_PASSWORD=hotdog
MONGO_DB_ROOT_PASSWORD=hotdogwithsauce
EMAIL_DEBUG=true
```

#### Explanation

- The production server will be available at the port `HOST_PORT`, which is managed by [Nginx](https://www.nginx.com/). Nginx will serve static files and forward API/socket requests to the backend container
- Database admin access is granted to user `root` (fixed) with password `MONGO_DB_ROOT_PASSWORD`, in the authentication db `admin` (fixed). Another user, `MONGO_DB_USERNAME`, will be used by the backend server to authenticate to the mongo container in order to have access to the db `MONGO_DB_NAME`, using password `MONGO_DB_PASSWORD`.
- `JWT_SECRET` will be used to sign Json Web Tokens.
- `EMAIL_DEBUG`, if set to `true`, will enable email debug mode, meaning that emails will be printed on console if a better way of sending them is not available.

#### Optional environment variables:

- `MAILER_EMAIL` and `MAILER_PASSWORD` are the credentials to use a mail account to send emails. If **both** have values, _nodemailer_ will use them to send emails.

Currently supported mail services:

- Gmail ([More info](https://nodemailer.com/usage/using-gmail/)).

**Note**: You can prevent uploading sensitive data inside the `.env` file with:  
`git update-index --assume-unchanged .env`

### Development mode

First you need to install server dependencies with `npm install`, run inside the server folder `backend/js`.  
To develop a server, run the docker compose file for **Development mode** with:  
`docker-compose -f docker-compose.dev.yml up -d` from the root folder.
Docker should create these containers:

- `mongo` that manages the database
  - Data is saved in a named volume by docker `hlp-mongo-db-data`
  - Logs are saved inside `/backend/mongo/data/log` on the host machine
  - Mongo setup is stored in `/backend/mongo/setup`
- `hlp-backend-dev` with the live version of the nodejs backend mapped with host source files, and updated in real-time by [nodemon](https://www.npmjs.com/package/nodemon)
  - Every file inside `/backend/js` is mapped inside the container, including _node_modules_
  - After an edit is detected by nodemon on the source files (.js, .json) index.js is restarted inside the container, so that changes are online as soon as possible
  - You can look at the container logs for errors or debugging, with `docker logs --follow <backend-container-id>`

## Development: client

To develop the client, follow the instructions in the [previous section](#development-server). When you have the backend ready and listening on its port, you can use any frontend to communicate with it, directly from your local machine or host.

### API Documentation

Available in the [Wiki](https://github.com/ldeluigi/higher-lower-pwned/wiki#backend-api-documentation).

### Developing the Angular Web App client

The client is developed and compiled on the host machine, so you need to run `npm install` in the frontend folder `frontend/angular/hlp` to download dependencies.
If you want to contribute to the main client made with Angular you can write your code while `ng serve` provides a live version if it, automatically updated and compiled.

Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

#### Manual tests

To test the angular client by hand usually you just need to run `ng serve`, but if you want to make the client available to every machine on your local network, making the angular host similar to a server, you need:

1. To make sure that the backend port is mapped to an host public port and reachable from the local network;
1. To run `ng serve --host 0.0.0.0 --port <port> --disableHostCheck` to serve the client on the specified port on your machine ip under your local network.

#### Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

#### Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

#### Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Production mode

To run the entire project in production mode just type `docker-compose up -d` in the root folder of the repository.

**Note:** Only requests to `/api` or `/socket` path are forwarded to the server by Nginx.

## Stopping containers

To properly stop running containers use `docker-compose [-f ...] down`.
To stop and **clean volumes** use `docker-compose [-f ...] down -v`.  
**Note:** _Volumes left inside docker storage could fill up the space on the host machine!_
