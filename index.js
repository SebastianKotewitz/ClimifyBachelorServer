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
const auth = require('./routes/auth');
const signalMaps = require('./routes/signalMaps');
const error = require('./middleware/error');
// const { createLogger, format, transports } = require('winston');
const morgan = require('morgan');
const bodyParser = require("body-parser");
const endMiddleware = require("./startup/resBodyLogger");

// To disable CORS
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-auth-token, roomId");
    res.header("Access-Control-Expose-Headers", "x-auth-token, roomId");
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, PATCH, OPTIONS');
    next();
});

app.use(bodyParser.json());
morgan.token("reqBody", (req) => `Req body: ${JSON.stringify(req.body)}`);
app.use(morgan("dev"));
app.use(morgan(":reqBody", {immediate: true}));

const port = config.get('port') || 80;
const baseUrl = config.get("base-url") || "/api/";


const logger = require('./startup/logger');

if (!process.env.jwtPrivateKey) {
    console.error("FATAL ERROR: jwtPrivateKey not set");
    process.exit(1);
}

if (process.env.NODE_ENV !== 'test')
{
    app.listen(port, () => logger.info(`Listening on port ${port}...`));
    const db = config.get('db');
    mongoose.connect(db, {useNewUrlParser: true})
        .then(() => logger.info(`Connected to ${db}...`))
        .catch(err => logger.info('Could not connect to MongoDB...', err));
}

app.use(express.json());

app.use(endMiddleware);
app.use(baseUrl + 'feedback/', feedback);
app.use(baseUrl + 'users', users);
app.use(baseUrl + 'rooms', rooms);
app.use(baseUrl + 'beacons', beacons);
app.use(baseUrl + 'questions', questions);
app.use(baseUrl + 'buildings', buildings);
app.use(baseUrl + 'auth', auth);
app.use(baseUrl + 'signalMaps', signalMaps);
app.use(error);

module.exports = app;
