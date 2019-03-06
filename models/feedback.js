const mongoose = require('mongoose');
const Joi = require('joi');


const feedbackSchema = new mongoose.Schema({
    questions: [{
        type: new mongoose.Schema({
            name: {
                type: String,
                minLength: 3,
                maxLength: 255,
                required: true
            },
            answer: {
                type: String,
                minLength: 3,
                maxLength: 255,

            }
        }),
    }],
    userId: {
        type: mongoose.Schema.ObjectId,
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
            location: {
                type: String,
                minLength: 3,
                maxLength: 255,
                required: true
            }
        }),
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
            answer: Joi.string().min(20).max(255)
        })),
    };
    return Joi.validate(feedback, schema);
}

exports.Feedback = Feedback;
exports.validate = validateFeedback;