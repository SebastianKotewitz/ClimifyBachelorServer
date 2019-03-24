//const jwt = require('jsonwebtoken');
//const config = require('config');
const {User} = require('../models/user');
const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {

    /*const token = req.header('x-auth-token');
    if (!token) return res.status(401).send('Access denied. No token provided.');

    try {
      const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
      req.user = decoded;
      next();
    }
    catch (ex) {
      res.status(400).send('Invalid token.');
    }*/


    const token = req.header("x-auth-token");
    if (!token) return res.status(401).send('Unauthorized. No json web token provided.');
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.jwtPrivateKey);
    } catch (e) {
        return res.status(400).send('Invalid token');
    }
    const userId = decoded._id;
    if (!userId) return res.status(401).send('Unauthorized. No userId provided.');

    if (!mongoose.Types.ObjectId.isValid(userId))
        return res.status(401).send(`User id ${userId} was not valid`);

    const user = await User.findById(userId);
    if (!user) return res.status(404).send(`User with id ${userId} was not found`);
    req.user = user;

    next();
};
