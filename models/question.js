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
        answerOptions: [{
            type: String,
            required: true
        }],
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
        answerOptions: Joi.array().items(Joi.string()).min(1).required(),
        buildingId: Joi.objectId().required()
    };

    //if (question.answerOptions.length < 1)
    //    return {error: {details: [{message: "hej"}]}}

    return Joi.validate(question, schema);
}


module.exports.Question = Question;
module.exports.validate = validateQuestion;
module.exports.questionSchema = questionSchema;