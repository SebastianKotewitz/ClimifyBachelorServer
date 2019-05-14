const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Fawn = require('fawn');
const {auth, authorized} = require('../middleware/auth');
Fawn.init(mongoose);
const validId = require("../middleware/validateIdParam");
const buildingController = require("../controllers/buildingController");

router.post('/', [auth, authorized], buildingController.createBuilding);

router.get("/:id", [auth, validId], buildingController.getBuilding);

router.get('/', auth, buildingController.getBuildings);

router.delete("/:id", [auth, authorized], buildingController.deleteBuilding);

module.exports = router;
