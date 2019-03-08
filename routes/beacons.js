const express = require('express');
const router = express.Router();
const { Beacon, validate } = require('../models/beacon');
const { Room } = require('../models/room');
const _ = require('lodash');


router.post('/', async (req, res) => {

    const {error} = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let {location, roomId, name, uuid} = req.body;


    const room = await Room.findById(roomId);
    if (!room) return res.status(404).send('Room with id ' + roomId + ' was not found');


    if (!location) location = room.location;

    const beacon = new Beacon({
        room,
        location,
        name,
        uuid
    });

    await beacon.save();
    res.send(beacon);
});

router.get('/', async (req, res) => {
    const beacons = await Beacon.find();
    res.send(beacons);
});

module.exports = router;
