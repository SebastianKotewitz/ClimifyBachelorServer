const mongoose = require('mongoose');
const Joi = require('joi');

const questionSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            minLength: 3,
            maxLength: 255,
            required: true
        },
        answerOptions: {
            type: [{
                type: String,
                required: true,
                minLength: 1,
                maxLength: 1024
            }],
            required: true
        },
        room: {
            type: mongoose.Types.ObjectId,
            ref: 'Room',
            required: true
        }
    });

const Question = mongoose.model('Question', questionSchema);

function validateQuestion(question) {
    const schema = {
        name: Joi.string().min(1).max(255).required(),
        answerOptions: Joi.array().items(Joi.string().min(1).max(1024)).min(1).required(),
        roomId: Joi.objectId().required()
    };

    return Joi.validate(question, schema);
}


module.exports.Question = Question;
module.exports.validate = validateQuestion;
module.exports.questionSchema = questionSchema;