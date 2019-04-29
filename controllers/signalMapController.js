const {SignalMap, validate, estimateNearestNeighbors} = require("../models/signalMap");
const {Room} = require("../models/room");
const {Beacon} = require("../models/beacon");

const createSignalMap = async (req, res) => {
    const {error} = validate(req.body);

    if (error) return res.status(400).send(error.details[0].message);

    const {beacons, buildingId, roomId} = req.body;
    let estimatedRoomId;

    for (let i = 0; i < beacons.length; i++) {
        const beacon = await Beacon.findById(beacons[i].beaconId);
        if (!beacon) return res.status(400).send(`Beacon with id ${beacons[i].beaconId} did not exist in database`);
        beacons[i]._id = beacons[i].beaconId;
    }

    if (!roomId) {
        if (!buildingId) res.status(400).send("Please provide either roomId or buildingId");

        let signalMaps = await SignalMap.find({isActive: true});
        for (let i = 0; i < signalMaps.length; i++) {
            const room = await Room.findById(signalMaps[i].room);
            if (room.building.toString() !== buildingId.toString()) {
                signalMaps.splice(i, 1);
                i--;
            }
        }
        estimatedRoomId = await estimateNearestNeighbors(beacons, signalMaps);
    } else {
        if(await SignalMap.find({room: roomId}))
            return res.status(400).send("There is already a signalmap for the given room");
    }

    let signalMap = new SignalMap({
        room: roomId || estimatedRoomId,
        beacons,
        isActive: !!roomId
    });
    await signalMap.save();
    res.send(signalMap);
};

const confirmRoom = async (req, res) => {
    const id = req.params.id;
    const signalMap = await SignalMap.findByIdAndUpdate(id, {
        $set: {
            isActive: true
        },
    }, {new: true});

    if (!signalMap) return res.status(404).send(`signalMap with id ${id} was not found in database`);
    res.send(signalMap);
};

module.exports.createSignalMap = createSignalMap;
module.exports.confirmRoom = confirmRoom;
