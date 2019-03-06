const mongoose = require('mongoose');
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
        type: new mongoose.Schema({
            name: {
                type: String,
                minLength: 3,
                maxLength: 255,
                required: true
            },
        }),
        required: true
    }
});

const Beacon = mongoose.model('Beacon', beaconSchema);

function validateBeacon(beacon) {

    const schema = {
        roomId: Joi.objectId().required(),
        location: Joi.string().min(1).max(255),
        name: Joi.string().min(1).max(255).required()
    };

    return Joi.validate(beacon, schema);
}

exports.Beacon = Beacon;
exports.validate = validateBeacon;