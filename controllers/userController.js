const _ = require('lodash');
const bcrypt = require("bcryptjs");
const { User, validate, validateAuthorized } = require('../models/user');
const StatusError = require("../errors/statusError");

const getUsers = async (req, res) => {
    const users = await User.find(null, "_id email role adminOnBuilding");
    res.send(users);
};

const getUserIdFromEmail = async (req, res) => {
    const email = req.params.email;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).send(`User with email ${email} was not found`);
    const userId = user.id;
    res.send(userId);
};

const makeUserAdmin = async (req, res) => {

    const { userId, buildingId } = req.body;
    const user = req.user;
    console.log('user.admin: ', user.adminOnBuildings);

    if (!userId || !buildingId)
        return res.status(400).send("Request should include userId and buildingId");

    if (!req.user.adminOnBuildings.find(elem => elem.toString() === buildingId))
        return res.status(403).send("User was not admin on building and can therefore not promote other users to admins");
    const newUser = await User.findById(userId);
    const adminOnBuildings = newUser.adminOnBuildings;

    if (adminOnBuildings.includes("buildingId"))
        return res.status(400).send("The chosen user is already admin on the building");

    // newUser.adminOnBuildings.push(buildingId);
    await User.update({ _id: userId }, { $push: { adminOnBuildings: buildingId } });

    res.send(newUser);
};

const createUser = async (req, res) => {

    let user;

    if (req.body.email) {
        try {
            await validateAuthorized(req.body);
        } catch (e) {
            return res.status(400).send(e.message);
        }
    } else {
        try {
            await validate(req.body);
        } catch (e) {
            return res.status(400).send(e.message);
        }
    }

    if (req.body.email) {
        const { email, password } = req.body;
        if (await User.findOne({ email })) return res.status(400).send("User already registered");

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
};



module.exports.getUsers = getUsers;
module.exports.makeUserAdmin = makeUserAdmin;
module.exports.createUser = createUser;
module.exports.getUserIdFromEmail = getUserIdFromEmail;
