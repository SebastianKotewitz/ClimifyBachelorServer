const express = require('express');
const mongoose = require('mongoose');
const { Building, validate } = require('../models/building');
const { Room } = require('../models/room');
const { User } = require('../models/user');
const _ = require('lodash');
const router = express.Router();
const Fawn = require('fawn');
const {auth, authorized} = require('../middleware/auth');
Fawn.init(mongoose);
const validId = require("../middleware/validateIdParam");


router.post('/', [auth, authorized], async (req, res) => {

    const {error} = validate(req.body);
    console.log(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let {name} = req.body;
    const user = req.user;

    const admin = await User.findById(user._id);
    if (!admin) return res.status(401).send(`User with id ${userId} is not authorized in system`);

    const building = new Building({
        name
    });

     admin.adminOnBuilding = building._id;
     await admin.save();
     await building.save();
     res.send(building);
});

router.get("/:id", [auth, validId], async (req, res) => {
    const building = await Building.findById(req.params.id);
    res.send(building);
});

router.get('/', auth, async (req, res) => {
    let buildings = await Building.find();
    let newBuildings = [];
    for (let i = 0; i < buildings.length; i++) {
        newBuildings.push(_.pick(buildings[i], ["name", "_id"]));
        newBuildings[i].rooms = await Room.find({building: buildings[i].id});
    }
    res.send(newBuildings);
});

module.exports = router;
