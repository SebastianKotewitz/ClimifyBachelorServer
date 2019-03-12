const express = require('express');
const router = express.Router();
const { Question, validate } = require('../models/question');
const _ = require('lodash');
const {Room} = require('../models/room');
const {Building} = require('../models/building');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');


router.post('/', [auth], async (req, res) => {

    const {error} = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const {name, buildingId} = req.body;

    const user = req.user;

    const building = await Building.findById(buildingId);
    if (!building) return res.status(404).send('Building with id ' + buildingId + ' was not found.');

    console.log(user.adminOnBuilding);
    console.log(buildingId);

    if (user.adminOnBuilding.toString() !== buildingId.toString())
        return res.status(403).send('Admin rights on the building are required to post new questions');

    const question = new Question({
        name,
        building: buildingId
    });

    await question.save();
    res.send(question);
});

router.get('/', auth, async (req, res) => {
    const roomId = req.header('roomId');
    if (!roomId) return res.status(400).send('No room id provided');

    if (!mongoose.Types.ObjectId.isValid(roomId))
        return res.status(400).send(`Room id ${roomId} was not valid`);

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).send(`Room with id ${roomId} was not found`);

    const questions = await Question.find();
    res.send(questions);
});

router.put('/:id', async (req, res) => {

    if (await Question.count({_id: req.params.id}) <= 0)
        return res.status(404).send('Question with id ' + req.params.id + ' was not found.');

    const question = await Question.findByIdAndUpdate(req.params.id, {
        $set: {
            name: req.body.name,
            answer: req.body.answer
        }
    }, {new: true});

    res.send(question);
});

module.exports = router;