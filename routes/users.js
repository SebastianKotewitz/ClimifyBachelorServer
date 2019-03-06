const express = require('express');
const {User, validate} = require('../models/user');
const _ = require('lodash');
const router = express.Router();

router.post('/', async (req, res) => {
    //const {error} = validate(req.body);
    //if (error) return res.status(400).send(error.details[0].message);

    let user = new User(req.body);
    await user.save();
    res.send(user);
});

router.get('/', async (req, res) => {
    const users = await User.find();
    res.send(users);
});

module.exports = router;