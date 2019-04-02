const express = require('express');
const router = express.Router();
const { Beacon, validate } = require('../models/beacon');
const { Room } = require('../models/room');
const _ = require('lodash');
const {auth, authorized} = require("../middleware/auth");


router.post('/', [auth, authorized], async (req, res) => {

    const {error} = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    console.log(req.user.role);
    if (req.user.role < 1) return res.status(403).send("Forbidden. User should be authorized");

    let {location, roomId, name, uuid} = req.body;

    console.log(location);

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
    res.send(_.pick(beacon, ["_id", "room", "location", "name", "uuid"]));
});

router.get('/', auth, async (req, res) => {
    const beacons = await Beacon.find();
    res.send(beacons);
});

module.exports = router;
