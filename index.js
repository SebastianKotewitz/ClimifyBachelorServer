require('express-async-errors');
const express = require('express');
const app = express();
const feedback = require('./routes/feedback');
const mongoose = require('mongoose');
const users = require('./routes/users');
const rooms = require('./routes/rooms');
const questions = require('./routes/questions');
const beacons = require('./routes/beacons');

const Joi = require('joi');
const error = require('./middleware/error');
Joi.objectId = require('joi-objectid')(Joi);


app.listen(3000, () => console.log('Listening on port 3000...'));

app.use(express.json());

mongoose.connect('mongodb://localhost/climify')
    .then(() => console.log('Connected to MongoDB...'))
    .catch(err => console.error('Could not connect to MongoDB...', err));

app.use('/api/feedback', feedback);
app.use('/api/users', users);
app.use('/api/rooms', rooms);
app.use('/api/beacons', beacons);
app.use('/api/questions', questions);
app.use(error);
/*
app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send('Something broke!')
});*/