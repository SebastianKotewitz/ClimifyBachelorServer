const mongoose = require('mongoose');
const Joi = require('joi');

const questionSchema = new mongoose.Schema(
    {
        value: {
            type: String,
            minlength: 3,
            maxlength: 1024,
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
        value: Joi.string().min(1).max(255).required(),
        roomId: Joi.objectId().required()
    };

    return Joi.validate(question, schema);
}


module.exports.Question = Question;
module.exports.validate = validateQuestion;
module.exports.questionSchema = questionSchema;
