const express = require('express');
const {Room, validate} = require('../models/room');
const {Building} = require('../models/building');
const _ = require('lodash');
const {auth, authorized} = require("../middleware/auth");
const validId = require("../middleware/validateIdParam");
const questionsController = require("../controllers/questionController");
const roomController = require("../controllers/roomController");
const router = express.Router();

router.post('/', [auth, authorized], async (req, res) => {
    const {error} = validate(req.body);

    if (error) return res.status(400).send(error.details[0].message);

    const {name, location, buildingId} = req.body;

    if (await Building.countDocuments({_id: buildingId}) <= 0)
        return res.status(404).send('Building with id ' + buildingId + ' was not found.');

    let room = new Room({
        name,
        location,
        building: buildingId
    });

    await room.save();
    res.send(room);
});

router.get('/', auth, async (req, res) => {
    const rooms = await Room.find();
    res.send(rooms);
});

router.get("/fromBuilding/:id", auth, async (req, res) => {
    console.log(req.params.id);
    const rooms = await Room.find({building: req.params.id});
    res.send(rooms);
});

router.delete("/:id", [auth, validId], roomController.deleteRoom)

module.exports = router;
