const mongoose = require('mongoose');
const Joi = require('joi');

const questionSchemeSchema = new mongoose.Schema(
    {
        questions: [{
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
        }],
        building: {
            type: mongoose.Types.ObjectId,
            ref: 'Building',
            required: true
        }
    });

const Question = mongoose.model('QuestionScheme', questionSchemeSchema);

function validateQuestion(question) {
    const schema = {
        questions: Joi.array().items(Joi.object({
            name: Joi.string().min(3).max(255),
            answer: Joi.number().integer().min(0).max(10)
        }).required()).required(),
        buildingId: Joi.objectId().required()
    };
    return Joi.validate(question, schema);
}

module.exports.Question = Question;
module.exports.validate = validateQuestion;
module.exports.questionSchema = questionSchemeSchema;