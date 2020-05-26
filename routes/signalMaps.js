const express = require('express');
const {auth, authorized} = require("../middleware/auth");
const validId = require("../middleware/validateIdParam");
const router = express.Router();
const {createSignalMap, confirmRoom, getSignalMaps, deleteSignalMapsOfRoom} = require("../controllers/signalMapController");

router.post('/', [auth], createSignalMap);

router.get('/', auth, getSignalMaps);

router.patch("/confirm-room/:id", [auth, authorized], confirmRoom);

router.delete("/:roomId", [auth, validId], deleteSignalMapsOfRoom)

module.exports = router;
