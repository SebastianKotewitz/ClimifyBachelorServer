const mongoose = require('mongoose');
const Joi = require('joi');
const jwt = require("jsonwebtoken");


const userSchema = new mongoose.Schema({
    email: {
        type: String,
        minLength: 3,
        maxLength: 255
    },
    password: {
        type: String,
        minLength: 3,
        maxLength: 1024
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    adminOnBuilding: {
        type: mongoose.Schema.ObjectId
    },
    role: {
        type: Number,
        min: 0,
        max: 2,
        required: true,
        default: 0
    }
});


userSchema.methods.generateAuthToken = function() {
    return jwt.sign({_id: this._id}, process.env.jwtPrivateKey);
};

const User = mongoose.model('User', userSchema);

function validate(user) {
    const schema = {};
    return Joi.validate(user, schema);
}

function validateAuthorizedUser(user) {
    const schema = {
        email: Joi.string().min(3).max(255).required().email(),
        password: Joi.string().regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/).required(),
    };
    return Joi.validate(user, schema);
}



module.exports.User = User;
module.exports.validate = validate;
module.exports.validateAuthorized = validateAuthorizedUser;
