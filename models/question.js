const mongoose = require('mongoose');
const {answerSchema} = require("./answer");

const Joi = require('joi');

const questionSchema = new mongoose.Schema(
  {
      value: {
          type: String,
          minlength: 3,
          maxlength: 1024,
          required: true
      },
      rooms: {
          type: [{
              type: mongoose.Schema.ObjectId,
              required: true,
              ref: "Room"
          }],
          validate: [(val) => val.length >= 1 && Array.isArray(val),
              "Question should be linked to at least one room"]
      },
      isActive: {
          type: Boolean,
          required: true,
          default: true
      },
      answerOptions: {
          type: [answerSchema],
          /*{
              type: mongoose.Schema.ObjectId,
              ref: "Answer",
              required: true
          }*/
          required: true,
          validate: [(val) => val.length >= 2 && Array.isArray(val),
              "Question should have at least two answer options"]
      },
      usersAnswered: {
          type: [mongoose.Schema.ObjectId]
      },
  });

const Question = mongoose.model('Question', questionSchema);

function validateQuestion(question) {
    const schema = {
        value: Joi.string().min(1).max(255).required(),
        rooms: Joi.array().items(Joi.objectId().required()).required(),
        answerOptions: Joi.array().items(Joi.string().min(1).max(255).required()).required(),
    };

    return Joi.validate(question, schema);
}


module.exports.Question = Question;
module.exports.validate = validateQuestion;
module.exports.questionSchema = questionSchema;
