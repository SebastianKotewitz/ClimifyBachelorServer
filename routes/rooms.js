const express = require('express');
const {Room, validate} = require('../models/room');
const {Building} = require('../models/building');
const _ = require('lodash');
const {auth, authorized} = require("../middleware/auth");
const validId = require("../middleware/validateIdParam");
const {deleteRoom, createRoom, getRooms} = require("../controllers/roomController");
const router = express.Router();


router.post('/', [auth, authorized], createRoom);

router.get('/', auth, getRooms);

router.get("/fromBuilding/:id", auth, async (req, res) => {
    console.log(req.params.id);
    const rooms = await Room.find({building: req.params.id});
    res.send(rooms);
});

router.delete("/:id", [auth, validId], deleteRoom)

module.exports = router;
