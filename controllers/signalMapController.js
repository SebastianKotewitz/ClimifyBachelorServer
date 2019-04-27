const {SignalMap, validate, estimateRoom} = require("../models/signalMap");
const {Room} = require("../models/room");

const createSignalMap = async  (req, res) => {
    const {error} = validate(req.body);

    if (error) return res.status(400).send(error.details[0].message);

    const {beacons, buildingId} = req.body;
    let {roomId} = req.body;

    if (!roomId) {
        if (!buildingId) res.status(400).send("Please provide either roomId or buildingId");

        let signalMaps = await SignalMap.find().populate("room");
        signalMaps = signalMaps.filter(elem => elem.room.building.toString() === buildingId);
        roomId = await estimateRoom(beacons, signalMaps);
    }
    const room = await Room.findById(roomId);

    let signalMap = new SignalMap({
        room: roomId,
        beacons
    });

    await signalMap.save();
    res.send(signalMap);
};

module.exports.createSignalMap = createSignalMap;
