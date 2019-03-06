const express = require('express');
const {Room, validate} = require('../models/room');
const _ = require('lodash');
const router = express.Router();

router.post('/', async (req, res) => {
    const {error} = validate(req.body);

    if (error) return res.status(400).send(error.details[0].message);

    let room = new Room(_.pick(req.body, ['name', 'location']));

    await room.save();
    res.send(room);
});

router.get('/', async (req, res) => {
    const rooms = await Room.find();
    res.send(rooms);
});

module.exports = router;