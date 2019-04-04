const express = require('express');
const router = express.Router();
const { Feedback, validate } = require('../models/feedback');
const { Room } = require('../models/room');
const { Answer } = require('../models/answer');
const { Question } = require('../models/question');
const { User } = require('../models/user');
const { Building } = require('../models/building');
const _ = require('lodash');
const validateId = require('../middleware/validateIdParam');
const {auth} = require('../middleware/auth');
const mongoose = require("mongoose");

router.post('/', auth, async (req, res) => {
    const {error} = validate(req.body);

    if (error) return res.status(400).send(error.details[0].message);

    const {roomId, answerId, questionId} = req.body;

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).send("Room with id " + roomId + " was not found");

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).send("User with id " + user._id + " was not found");

    const answer = await Answer.findById(answerId);
    if (!answer) return res.status(404).send("Answer with id " + answerId + " was not found");

    const question = await Question.findById(questionId);
    if (!question) return res.status(404).send("Question with id " + questionId + " was not found");

    if (question.room.toString() !== roomId)
        return res.status(400).send("Question was not from the same room as the feedback given");

    let feedback = new Feedback(
        {
            user: user._id,
            room: roomId,
            answer: answerId,
            question: questionId
        }
    );

    const building = await Building.findById(room.building);
    building.feedback.push(feedback);

    await feedback.save();
    await building.save();
    res.send(_.pick(feedback, ["_id", "user", "room", "answer", "question"]));

});

router.get('/', auth, async (req, res) => {
    const query = feedbackQuery(req.query, req.user._id);
    if (!query) return res.status(400).send("Invalid query parameter");
    console.log(query);
    const feedback = await Feedback.find(query).populate("answer");

    res.send(feedback);
});

router.get('/buildingFeedback/:id', [validateId, auth], async (req, res) => {

    const building = await Building.findById(req.params.id);
    if (!building) return res.status(404).send(`Building with id ${req.params.id} was not found`);

    const query = feedbackQuery(req.query, req.user._id);
    if (!query) return res.status(400).send("Invalid query parameter");
    const feedback = await Feedback.find(query).populate('user', '-__v -_id');
    res.send(feedback);
});

router.get('/userFeedback/:userId', [validateId, auth], async (req, res) => {
    const userId = req.params.userId;

    const query = feedbackQuery(req.query, req.user._id);
    if (!query) return res.status(400).send("Invalid query parameter");
    if (await User.countDocuments({_id: userId}) <= 0)
        return res.status(404).send('User with id ' + userId + ' was not found.');


    query.user = userId;
    const feedback = await Feedback.find(query).populate('user');
    res.send(feedback);
});

router.get("/answeredQuestions", auth, async (req, res) => {

    let answeredQuestions = [];

    const query = feedbackQuery(req.query, req.user._id);
    if (!query) return res.status(400).send("Invalid query parameter");
    const feedback = await Feedback.find(query).populate("question");

    for (let i = 0; i < feedback.length; i++) {
        const index = answeredQuestions.findIndex((answeredQuestion) => {
            return answeredQuestion.question._id === feedback[i].question._id;
        });
        if (index >= 0) {
            answeredQuestions[index].timesAnswered++;
        } else {
            answeredQuestions.push({
                question: _.pick(feedback[i].question, ["value", "_id"]),
                timesAnswered: 1
            })

        }
    }
    res.send(Array.from(answeredQuestions));
});

router.get("/questionStatistics/:questionId", auth, async (req, res) => {
    res.send([{answer: "hej"}]);
});


function feedbackQuery (query, userId) {
    let feedbackQuery = {};
    let today = new Date();

    if (query.room) {
        if (!mongoose.Types.ObjectId.isValid(query.room)) return null;
        feedbackQuery.room = query.room;
    }

    switch (query.t) {
        case "day":
            feedbackQuery.createdAt = {
                $gt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), today.getHours()-24, today.getMinutes())
            };
            break;
        case "week":
            feedbackQuery.createdAt = {
                $gt: new Date(today.getFullYear(), today.getMonth(), today.getDate()-7, today.getHours())
            };
            break;
        case "month":
            feedbackQuery.createdAt = {
                $gt: new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())
            };
            break;
        case "year":
            feedbackQuery.createdAt = {
                $gt: new Date(today.getFullYear() - 1, today.getMonth())
            };
            break;
        case undefined:
            break;
        default:
            return null;
    }

    switch (query.user) {
        case "me":
            feedbackQuery.user = userId;
            break;
        case "all":
            break;
        case undefined:
            break;
        default:
            return null;
    }

    return feedbackQuery;
}

module.exports = router;
