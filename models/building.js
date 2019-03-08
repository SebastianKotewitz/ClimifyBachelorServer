const mongoose = require('mongoose');
const Joi = require('joi');
const {buildingSchema} = require('./room');

const buildingSchema = new mongoose.Schema({
    name: {
        type: String,
        minLength: 1,
        maxLength: 255,
        required: true
    },
    admin: {
        ref: 'User',
        type: mongoose.Types.ObjectId
    },
});

const Building = mongoose.model('Building', buildingSchema);

function validateBeacon(building) {

    const schema = {
        name: Joi.string().min(1).max(255).required(),

    };

    return Joi.validate(building, schema);
}

exports.Beacon = Beacon;
exports.validate = validateBeacon;