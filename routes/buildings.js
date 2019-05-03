const express = require('express');
const mongoose = require('mongoose');
const {Building, validate} = require('../models/building');
const {Room} = require('../models/room');
const {User} = require('../models/user');
const _ = require('lodash');
const router = express.Router();
const Fawn = require('fawn');
const {auth, authorized} = require('../middleware/auth');
Fawn.init(mongoose);
const validId = require("../middleware/validateIdParam");
const buildingController = require("../controllers/buildingController")

router.post('/', [auth, authorized], async (req, res) => {

    try {
        await validate(req.body)
    } catch (e) {
        return res.status(400).send(e.message);
    }

    let {name} = req.body;
    const user = req.user;

    const admin = await User.findById(user._id);
    if (!admin) return res.status(401).send(`User with id ${userId} is not authorized in system`);

    const building = new Building({
        name
    });

    admin.adminOnBuildings.push(building._id);
    await admin.save();
    await building.save();
    res.send(building);
});

router.get("/:id", [auth, validId], async (req, res) => {
    const building = await Building.findById(req.params.id);
    if (!building) return res.status(404).send(`Building with id ${req.params.id} was not found`);
    const newBuilding = _.pick(building, ["name", "_id"]);
    newBuilding.rooms = await Room.find({building: building.id});

    res.send(newBuilding);
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

router.delete("/:id", [auth, authorized], buildingController.deleteBuilding);

module.exports = router;
