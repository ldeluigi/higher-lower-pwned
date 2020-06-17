# HigherLowerPwned

This project is a web-based game where you guess what password is the most popular between two shown on screen.

## Technologies
**Note:** _Versions listed here refer to the one used to build the project, but it should work with the most recent minor version of the same major._

### Needed on the host
- [Angular CLI](https://github.com/angular/angular-cli) version 9.1.8.
- [NodeJS](https://nodejs.org/) version 12.18.0.
- [Docker](https://www.docker.com/) engine version 19.03.1.

### Used in the project
- Nginx
- Nodemon
- Socket.io
- MongoDB
- Express
- Angular
- Angular Material
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
```
This would mean that:
- The production server will be available at the port `HOST_PORT`, which is managed by [Nginx](https://www.nginx.com/). Nginx will serve static files and forward API/socket requests to the backend container
- Database admin access is granted to user `root` (fixed) with password `MONGO_DB_ROOT_PASSWORD`, in the authentication db `admin` (fixed). Another user, `MONGO_DB_USERNAME`, will be used by the backend server to authenticate to the mongo container in order to have access to the db `MONGO_DB_NAME`, using password `MONGO_DB_PASSWORD`.
- `JWT_SECRET` will be used to sign Json Web Tokens.

### Development mode

To develop a server, run the docker compose file for __Development mode__ with:  
`docker-compose -f docker-compose.dev.yml up -d`  
Docker should create these containers:
- `mongo` that manages the database
  - Data is saved in a named volume by docker `hlp-mongo-db-data`
  - Logs are saved inside `/mongo/data/log` on the host machine
  - Mongo setup is stored in `/mongo/setup`
- `hlp-backend-dev` with the live version of the nodejs backend mapped with host source files, and updated in real-time by [nodemon](https://www.npmjs.com/package/nodemon)
  - Every file inside `/server` is mapped inside the container
  - After an edit is detected by nodemon on the source files (.js, .json) index.js is restarted inside the container, so that changes are online as soon as possible

## Development: client

To develop a client, follow the instructions in the [previous section](#development-server). When you have the backend ready and listening on its port, you can use any frontend to communicate with it, directly from your local machine or host.

### Developing the Angular Web App client
If you want to contribute to the main client made with Angular you can write your code while `ng serve` provides a live version if it, automatically updated and compiled.

Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

#### Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

#### Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

#### Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Production mode

To run the entire project in production mode just type `docker-compose up -d` in the root folder of the repository.

## Stopping containers

To properly stop running containers use `docker-compose [-f ...] down`.
To stop and __clean volumes__ use `docker-compose [-f ...] down -v`.  
**Note:** _Volumes left inside docker storage could fill up the space_