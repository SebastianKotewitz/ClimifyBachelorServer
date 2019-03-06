const express = require('express');
const router = express.Router();
const { Beacon, validate } = require('../models/beacon');
const { Room } = require('../models/room');
const _ = require('lodash');


router.post('/', async (req, res) => {

    const {error} = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const room = await Room.findById(req.body.roomId);
    if (!room) return res.status(404).send('Room with id ' + req.body.roomId + ' was not found');

    let location = room.location;
    if (req.body.location) location = req.body.location;

    const beacon = new Beacon({
        room,
        location,
        name: req.body.name
    });

    await beacon.save();
    res.send(beacon);
});

router.get('/', async (req, res) => {
    const beacons = await Beacon.find();
    res.send(beacons);
});

module.exports = router;
