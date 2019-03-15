const mongoose = require('mongoose');
const Joi = require('joi');


const feedbackSchema = new mongoose.Schema({
    questions: [{
        _id: {
            type: mongoose.Types.ObjectId,
            ref: 'Question',
            required: true
        },
        name: {
            type: String,
            minLength: 3,
            maxLength: 255,
            required: true
        },
        answer: {
            type: String,
            required: true
        }
    }],
    user: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    room: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'Room'
    }
}, {timestamps: true});


const Feedback = mongoose.model('Feedback', feedbackSchema);

function validateFeedback(feedback) {
    const schema = {
        roomId: Joi.objectId().required(),
        // You only send genre id
        // Then we find the genre in the separate list
        // and send that with the movie object
        questions: Joi.array().items(Joi.object({
            _id: Joi.objectId().required(),
            answer: Joi.string().min(1).max(255).required()
        }).required()).required(),
    };
    return Joi.validate(feedback, schema);
}

exports.Feedback = Feedback;
exports.validate = validateFeedback;
exports.feedbackSchema = feedbackSchema;