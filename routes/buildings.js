const express = require('express');
const mongoose = require('mongoose');
const { Building, validate } = require('../models/building');
const { User } = require('../models/user');
const _ = require('lodash');
const router = express.Router();
const Fawn = require('fawn');
const {auth} = require('../middleware/auth');
Fawn.init(mongoose);


router.post('/', auth, async (req, res) => {

    const {error} = validate(req.body);
    console.log(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let {name} = req.body;
    const user = req.user;

    const admin = await User.findById(user._id);
    if (!admin) return res.status(401).send('User with id ' + userId + ' is not authorized in system');

    const building = new Building({
        name
    });

     admin.adminOnBuilding = building._id;
     await admin.save();
     await building.save();
     res.send(building);
});

router.get('/', async (req, res) => {
    const buildings = await Building.find();
    res.send(buildings);
});

module.exports = router;
