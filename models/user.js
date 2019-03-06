const mongoose = require('mongoose');
const Joi = require('joi');


const userSchema = new mongoose.Schema({
    username: {
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
    }
});

const User = mongoose.model('User', userSchema);

function validateUser(user) {
    const schema = {

        username: Joi.string().min(3).max(12),
        password: Joi.string().regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/),
        isAdmin: Joi.boolean(),
    };
    return Joi.validate(user, schema);
}

module.exports.User = User;
module.exports.validate = validateUser;