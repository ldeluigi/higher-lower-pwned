const express = require('express')
const app = express()
const config = require('./config/config');
const mongoose = require('mongoose');

mongoose.connect(config.mongoose.url, config.mongoose.options).then(() => {
    console.log('Connected to MongoDB');
    app.get('/', (req, res) => res.send('Hello World!!!')) // move to /app or something
    server = app.listen(config.port, () => {
      console.log(`Listening to port ${config.port}`);
    });
});


/*

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
*/