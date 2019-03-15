const express = require('express');
const router = express.Router();
const { Feedback, validate } = require('../models/feedback');
const { Room } = require('../models/room');
const { Question } = require('../models/question');
const { User } = require('../models/user');
const { Building } = require('../models/building');
const _ = require('lodash');
const validateId = require('../middleware/validateId');
const auth = require('../middleware/auth');


router.post('/', auth, async (req, res) => {
    const {error} = validate(req.body);

    if (error) return res.status(400).send(error.details[0].message);

    const {roomId, questions} = req.body;

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).send("Room with id " + roomId + " was not found");

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).send("User with id " + user._id + " was not found");

    const numberOfQuestions = await Question.countDocuments({building: room.building});

    if (questions.length !== numberOfQuestions)
        return res.status(400).send('Insufficient or too many questions answered. ' + numberOfQuestions + ' question(s) should be answered');

    const questionIds = new Set();
    for (let i = 0; i < questions.length; i++) {
        const question = await Question.findById(questions[i]._id);
        if (!question || question.building.toString() !== room.building.toString()){
            return res.status(404).send('Question with id ' + questions[i]._id + ' was not found in building');
        }

        if (!question.answerOptions.includes(questions[i].answer))
            return res.status(400).send('Answer was not an answer option for answered question');

        questions[i].name = question.name;
        questionIds.add(questions[i]._id);
    }

    // Check if question array posted has any duplicates:
    if (questionIds.size !== questions.length)
        return res.status(400).send('Some questions appeared more than once. Please only answer unique questions');

    let feedback = new Feedback(
        {
            user: user._id,
            room,
            questions
        }
    );

    const building = await Building.findById(room.building);
    building.feedback.push(feedback);

    await feedback.save();
    await building.save();
    res.send(feedback);

});

router.get('/', async (req, res) => {
    const feedback = await Feedback.find();
    res.send(feedback);
});

router.get('/buildingFeedback/:id', validateId, async (req, res) => {

    const building = await Building.findById(req.params.id);
    if (!building) return res.status(404).send(`Building with id ${req.params.id} was not found`);

    const feedback = await Feedback.find().populate('user', '-__v -_id');
    res.send(feedback);
});

router.get('/userFeedback/:userId', validateId, async (req, res) => {
    const userId = req.params.userId;
    if (await User.count({_id: userId}) <= 0)
        return res.status(404).send('User with id ' + userId + ' was not found.');

    const feedback = await Feedback.find({user: userId}).populate('user');
    res.send(feedback);
});

module.exports = router;