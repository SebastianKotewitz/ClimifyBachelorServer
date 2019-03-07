const express = require('express');
const router = express.Router();
const { Feedback, validate } = require('../models/feedback');
const { Room } = require('../models/room');
const { Question } = require('../models/question');
const _ = require('lodash');


router.post('/', async (req, res) => {

    const {error} = validate(req.body);

    if (error) return res.status(400).send(error.details[0].message);

    const {roomId, userId, questions} = req.body;

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).send("Room with id " + roomId + " was not found");

    const numberOfQuestions = await Question.count();

    if (questions.length !== numberOfQuestions)
        return res.status(400).send('Insufficient or too many questions answered. ' + numberOfQuestions + ' question(s) should be answered');

    for (let i = 0; i < questions.length; i++) {
        const question = await Question.findById(questions[i]._id);
        if (!question) return res.status(404).send('Question with id ' + questions[i]._id + ' was not found');
        questions[i].name = question.name;
    }

    let feedback = new Feedback(
        {
            userId,
            room,
            questions
        }
    );
    await feedback.save();

    res.send(feedback);
});

router.get('/', async (req, res) => {
    const feedback = await Feedback.find();
    console.log(feedback);
    res.send(feedback);
});

module.exports = router;