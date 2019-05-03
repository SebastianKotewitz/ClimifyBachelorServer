const express = require('express');
const router = express.Router();
const { Beacon, validate } = require('../models/beacon');
const { Building } = require('../models/building');
const _ = require('lodash');
const {auth, authorized} = require("../middleware/auth");


router.post('/', [auth, authorized], async (req, res) => {

    try {
        await validate(req.body);
    } catch (e) {
        return res.status(400).send(e.message);
    }


    console.log(req.user.role);
    if (req.user.role < 1) return res.status(403).send("Forbidden. User should be authorized");

    let {buildingId, name, uuid} = req.body;

    const building = await Building.findById(buildingId);
    if (!building) return res.status(404).send('Building with id ' + buildingId + ' was not found');

    const beacon = new Beacon({
        building,
        name,
        uuid
    });

    await beacon.save();
    res.send(_.pick(beacon, ["_id", "building", "name", "uuid"]));
});

router.delete("/:id", async (req, res) => {

    const beacon = await Beacon.deleteOne({_id: req.params.id});
    res.send(beacon);
});

router.get('/', auth, async (req, res) => {
    const beacons = await Beacon.find().populate("building");
    res.send(beacons);
});

module.exports = router;
