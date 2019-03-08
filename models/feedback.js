const mongoose = require('mongoose');
const Joi = require('joi');
const {questionSchema} = require('./question');
const {roomSchema} = require('./room');


const feedbackSchema = new mongoose.Schema({
    questions: [questionSchema],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    room: {
        type: roomSchema,
        required: true
    }
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

function validateFeedback(feedback) {
    const schema = {
        roomId: Joi.objectId().required(),
        // You only send genre id
        // Then we find the genre in the separate list
        // and send that with the movie object
        userId: Joi.objectId().required(),
        questions: Joi.array().items(Joi.object({
            _id: Joi.objectId().required(),
            answer: Joi.number().min(0).max(10).required()
        }).required()).required(),
    };
    return Joi.validate(feedback, schema);
}

exports.Feedback = Feedback;
exports.validate = validateFeedback;