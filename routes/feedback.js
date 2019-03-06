const express = require('express');
const router = express.Router();
const { Feedback, validate } = require('../models/feedback');
const { Room } = require('../models/room');
const _ = require('lodash');


router.post('/', async (req, res) => {

    const {error} = validate(req.body);

    if (error) return res.status(400).send(error.details[0].message);

    const room = await Room.findById(req.body.roomId);
    if (!room) return res.status(404).send("Room with id " + req.body.roomId + " was not found");


    let feedback = new Feedback(
        {
            userId: req.body.userId,
            room,
        }
    );
    console.log(feedback);
    await feedback.save();

    res.status(200).send(feedback);
});

router.get('/', async (req, res) => {
    const feedback = await Feedback.find();
    console.log(feedback);
    res.send(feedback);
});

module.exports = router;