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
const error = require('./middleware/error');
const { createLogger, format, transports } = require('winston');
const morgan = require('morgan');

app.use(morgan('dev'));

const port = config.get('port') || 80;

const logger = require('./startup/logger');
//
// If we're not in production then **ALSO** log to the `console`
// with the colorized simple format.
//

if (process.env.NODE_ENV !== 'test')
{
    app.listen(port, () => logger.info(`Listening on port ${port}...`));
    const db = config.get('db');
    mongoose.connect(db, {useNewUrlParser: true})
        .then(() => logger.info(`Connected to ${db}...`))
        .catch(err => logger.info('Could not connect to MongoDB...', err));

}


app.use(express.json());


app.use('/api/feedback', feedback);
app.use('/api/users', users);
app.use('/api/rooms', rooms);
app.use('/api/beacons', beacons);
app.use('/api/questions', questions);
app.use('/api/buildings', buildings);
app.use(error);

module.exports = app;
