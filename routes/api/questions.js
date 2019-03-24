const express = require('express');
const router = express.Router();
const { Question, validate } = require('../../models/question');
const { Answer } = require('../../models/answer');
const _ = require('lodash');
const {Room} = require('../../models/room');
const {Building} = require('../../models/building');
const mongoose = require('mongoose');
const auth = require('../../middleware/auth');


router.post('/', [auth], async (req, res) => {

    const {error} = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    if (req.user.role < 1 ) return res.status(403).send("User should be authorized to post questions");

    const {value, roomId, answerOptions} = req.body;

    const user = req.user;

    if (answerOptions.length < 2)
        res.status(400).send("Minimum 2 answer options should be provided");

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).send('Room with id ' + roomId + ' was not found.');

    const building = await Building.findById(room.building);
    if (!building) return res.status(404).send('Building with id ' + room.building + ' was not found.');

    if (!user.adminOnBuilding || user.adminOnBuilding.toString() !== building._id.toString())
        return res.status(403).send('Admin rights on the building are required to post new questions');

    const question = new Question({
        value,
        room: roomId,
    });

    for (let i = 0; i < answerOptions.length; i++) {
        let answer = new Answer({value: answerOptions[i], question: question.id});
        await answer.save();
    }

    await question.save();
    res.send(_.pick(question, ["_id", "room", "value"]));
});

router.get('/', auth, async (req, res) => {
    const roomId = req.header('roomId');
    if (!roomId) return res.status(400).send('No room id provided');

   if (!mongoose.Types.ObjectId.isValid(roomId))
       return res.status(400).send(`Room id ${roomId} was not valid`);

   const room = await Room.findById(roomId);
   if (!room) return res.status(404).send(`Room with id ${roomId} was not found`);

    const questions = await Question.find({room: room._id});
    res.send(questions);
});

router.put('/:id', async (req, res) => {

    if (await Question.countDocuments({_id: req.params.id}) <= 0)
        return res.status(404).send('Question with id ' + req.params.id + ' was not found.');

    const question = await Question.findByIdAndUpdate(req.params.id, {
        $set: {
            value: req.body.value,
            answer: req.body.answer
        }
    }, {new: true});

    res.send(question);
});

module.exports = router;
