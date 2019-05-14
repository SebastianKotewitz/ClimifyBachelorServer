const express = require('express');
const {auth, authorized} = require("../middleware/auth");
const router = express.Router();
const {createSignalMap, confirmRoom, getSignalMaps} = require("../controllers/signalMapController");

router.post('/', [auth], createSignalMap);

router.get('/', auth, getSignalMaps);

router.patch("/confirm-room/:id", [auth, authorized], confirmRoom);

module.exports = router;
