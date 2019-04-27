const express = require('express');
const {SignalMap, validate} = require('../models/signalMap');
const {Room} = require('../models/room');
const {auth, authorized} = require("../middleware/auth");
const router = express.Router();
const {createSignalMap} = require("../controllers/signalMapController");
// import * as signalMapController from "../controllers/signalMapController";

router.post('/', [auth, authorized], createSignalMap);


router.get('/', auth, async (req, res) => {
    const signalMaps = await SignalMap.find();
    res.send(signalMaps);
});

module.exports = router;
