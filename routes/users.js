const express = require('express');
const mongoose = require('mongoose');
const {User, validate} = require('../models/user');
const _ = require('lodash');
const router = express.Router();
const auth = require('../middleware/auth');
const {Building} = require('../models/building');

router.post('/', async (req, res) => {

    const {error} = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user = new User(req.body);
    await user.save();
    res.send(user);
});

router.patch('/connectToBuilding/:id', auth, async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
        return res.status(404).send('Building id ' + req.params.id + ' is invalid');

    const building = await Building.findById(req.params.id);
    if (!building) return res.status(404).send('Building with id ' + req.params.id + ' was not found');

    const user = req.user;

    user.building = req.params.id;
    await user.save();
    res.send(user);
});

router.patch('/makeAdmin', async (req, res) => {
    const user = await User.findByIdAndUpdate(req.body.id, { $set: {
        adminOnBuilding: req.body.buildingId
        }});

    res.send(user);
});

router.get('/', async (req, res) => {
    const users = await User.find();

    res.send(users);

});

module.exports = router;