const winston = require('winston');
require('express-async-errors');
require('dotenv').config();
const config = require('config');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const express = require('express');
const app = express();
const feedback = require('./routes/feedback');
const mongoose = require('mongoose');
const users = require('./routes/users');
const rooms = require('./routes/rooms');
const questions = require('./routes/questions');
const beacons = require('./routes/beacons');
const buildings = require('./routes/buildings');
const logger = require('./startup/logger');
const error = require('./middleware/error');



const port = process.env.PORT || 3000;
const server = app.listen(port, () => logger.info(`Listening on port ${port}...`));

app.use(express.json());

const db = config.get('db');
mongoose.connect(db)
    .then(() => logger.info(`Connected to ${db}...`))
    .catch(err => logger.error('Could not connect to MongoDB...', err));


app.use('/api/feedback', feedback);
app.use('/api/users', users);
app.use('/api/rooms', rooms);
app.use('/api/beacons', beacons);
app.use('/api/questions', questions);
app.use('/api/buildings', buildings);
app.use(error);

module.exports = server;