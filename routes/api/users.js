const express = require('express');
const {User, validate, validateAuthorized} = require('../../models/user');
const _ = require('lodash');
const router = express.Router();
const bcrypt = require("bcrypt");

router.post('/', async (req, res) => {

    let error;
    let user;

    if (req.body.email) {
        error = validateAuthorized(req.body);
    } else {
        error = validate(req.body);
    }

    if (error.error) return res.status(400).send(error.error.details[0].message);


    if (req.body.email) {
        const {email, password} = req.body;
        if (await User.findOne({email})) return res.status(400).send("User already registered");

        const salt = await bcrypt.genSalt();
        user = new User(_.pick(req.body, ['email', "password"]));
        user.password = await bcrypt.hash(password, salt);
        user.role = 1; // Authorized
    } else {
        user = new User();
    }


    await user.save();

    const token = user.generateAuthToken();

    res.header('x-auth-token', token).send(_.pick(user, ["_id", "email"]));
});

router.get('/', async (req, res) => {
    const users = await User.find(null, "_id email role");

    res.send(users);

});

router.patch('/makeAdmin', async (req, res) => {
    const user = await User.findByIdAndUpdate(req.body.id, { $set: {
        adminOnBuilding: req.body.buildingId
        }});

    res.send(user);
});

module.exports = router;
