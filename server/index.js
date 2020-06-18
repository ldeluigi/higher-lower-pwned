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
   NOTE:
   Configuration of boilerplate server files is yet to be done.
   Please refer to an online *GOOD* example and don't make a mess.
   Thanks - Delu
*/