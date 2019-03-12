const mongoose = require('mongoose');
const {roomSchema} = require('./room');
const Joi = require('joi');

const beaconSchema = new mongoose.Schema({
    name: {
       type: String,
       minLength: 1,
       maxLength: 255,
       required: true
    },
    location: {
        type: String,
        minLength: 1,
        maxLength: 255,
        required: true
    },
    room: {
        type: roomSchema,
        required: true
    },
    uuid: {
        type: String,
        required: true,
        validate: /^[a-zA-Z\d]{8}-[a-zA-Z\d]{4}-[a-zA-Z\d]{4}-[a-zA-Z\d]{4}-[a-zA-Z\d]{12}$/
    }
});

const Beacon = mongoose.model('Beacon', beaconSchema);

function validateBeacon(beacon) {

    const schema = {
        roomId: Joi.objectId().required(),
        location: Joi.string().min(1).max(255),
        name: Joi.string().min(1).max(255).required(),
        uuid: Joi.string().regex(/^[a-zA-Z\d]{8}-[a-zA-Z\d]{4}-[a-zA-Z\d]{4}-[a-zA-Z\d]{4}-[a-zA-Z\d]{12}$/).required()
    };

    return Joi.validate(beacon, schema);
}

exports.Beacon = Beacon;
exports.validate = validateBeacon;