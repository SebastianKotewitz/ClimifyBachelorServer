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
        answer: {
            type: Number,
            minValue: 0,
            maxValue: 10
        },
        building: {
            type: mongoose.Types.ObjectId,
            ref: 'Building',
            required: true
        }
    });

const Question = mongoose.model('Question', questionSchema);

function validateQuestion(question) {
    const schema = {
        name: Joi.string().min(1).max(255).required(),
        answer: Joi.number().integer().min(0).max(10),
        buildingId: Joi.objectId().required()
    };
    return Joi.validate(question, schema);
}


module.exports.Question = Question;
module.exports.validate = validateQuestion;
module.exports.questionSchema = questionSchema;