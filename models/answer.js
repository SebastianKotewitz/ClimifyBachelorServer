const mongoose = require('mongoose');
const Joi = require('joi');

const answerSchema = new mongoose.Schema({
  value: {
    type: String,
    minLength: 1,
    maxLength: 1024,
    trim: true,
    required: true
  },
  /*question: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "Question"
  }*/
});

const Answer = mongoose.model('Answer', answerSchema);

function validateAnswer(answer) {

  const schema = {
    // questionId: Joi.objectId().required(),
    value: Joi.string().min(1).max(255).required(),
  };

  return Joi.validate(answer, schema);
}

exports.Answer = Answer;
exports.validate = validateAnswer;
exports.answerSchema = answerSchema;
