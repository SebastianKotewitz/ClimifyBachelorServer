const {SignalMap, validate, estimateRoom} = require("../models/signalMap");
const {Room} = require("../models/room");

const createSignalMap = async  (req, res) => {
    const {error} = validate(req.body);

    if (error) return res.status(400).send(error.details[0].message);

    const {beacons, buildingId, roomId} = req.body;
    let estimatedRoomId;

    if (!roomId) {
        if (!buildingId) res.status(400).send("Please provide either roomId or buildingId");

        let signalMaps = await SignalMap.find();
        for (let i = 0; i < signalMaps.length; i++) {
            const room = await Room.findById(signalMaps[i].room);
            if (room.building.toString() !== buildingId.toString()){
                signalMaps.splice(i, 1);
                i--;
            }
        }
        estimatedRoomId = await estimateRoom(beacons, signalMaps);
    }
    const room = await Room.findById(roomId);

    let signalMap = new SignalMap({
        room: roomId || estimatedRoomId,
        beacons,
        isActive: !!roomId
    });

    await signalMap.save();
    console.log("heeej", signalMap);
    res.send(signalMap);
};

module.exports.createSignalMap = createSignalMap;
