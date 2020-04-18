const express = require('express');
const { validateAuthorized } = require("../models/user");
const bcrypt = require("bcryptjs");
const { User } = require("../models/user");
const router = express.Router();
const { auth } = require('../middleware/auth');

const FAIL_AUTH_TEXT = "Invalid email or password";

router.post("/", async (req, res) => {
    const { error } = validateAuthorized(req.body);
    if (error) return res.status(400).send(error.message);

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).send(FAIL_AUTH_TEXT);

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).send(FAIL_AUTH_TEXT);

    const token = user.generateAuthToken();

    res.header("x-auth-token", token).send("Login successful");
});

router.get("/renew", auth, async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).send("User with id " + user._id + " was not found");

    const token = user.generateAuthToken();

    res.header("x-auth-token", token).send("New token generated");
});

module.exports = router;
