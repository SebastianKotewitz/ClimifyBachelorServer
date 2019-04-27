const mongoose = require('mongoose');
const Joi = require('joi');

const signalMapSchema = new mongoose.Schema({
    beacons: {
        type: [{
            beacon: {
                type: mongoose.Types.ObjectId,
                ref: "Beacon"
            },
            signals: [Number]
        }]
    },
    room: {
        type: mongoose.Types.ObjectId,
        ref: "Room"
    }
});

function alignedClientBeacons(serverBeacons, clientBeacons) {

    const alignedBeacons = new Array(serverBeacons.length);
    console.log("called");
    console.log("client", clientBeacons);
    console.log("server", serverBeacons);


    for (let i = 0; i < clientBeacons.length; i++) {
        const index = serverBeacons.findIndex(beacon => beacon._id.toString() === clientBeacons[i].beaconId.toString());
        alignedBeacons[index] = clientBeacons[i];
    }

    // console.log('server: ', serverBeacons);
    // console.log('client: ', clientBeacons);
    // console.log('alignedBeacons: ', alignedBeacons);
    return alignedBeacons;
}

function estimateRoom(beacons, signalMaps) {

    const minDistToRoom = {
        room: signalMaps[0].room,
        distance: Number.MAX_SAFE_INTEGER
    };

    for (let i = 0; i < signalMaps.length; i++) {

        const alignedBeacons = alignedClientBeacons(signalMaps[i].beacons, beacons);


        for (let j = 0; j < alignedBeacons[i].signals.length; j++) {

            let sum = 0;
            for (let k = 0; k < signalMaps[i].beacons.length; k++) {
                if (!alignedBeacons[k]) {
                    alignedBeacons[k] = {
                        signals: [signalMaps[i].beacons[k].signals[j]]
                    };
                }

                const clientSignal = alignedBeacons[k].signals[0];
                sum += (signalMaps[i].beacons[k].signals[j] - clientSignal) ** 2;
            }

            const distance = Math.sqrt(sum);
            console.log(distance);
            if (distance < minDistToRoom.distance) {
                minDistToRoom.room = signalMaps[i].room;
                minDistToRoom.distance = distance;
            }
        }
    }

    console.log(minDistToRoom);

    return minDistToRoom.room;
}

const SignalMap = mongoose.model('SignalMap', signalMapSchema);

function validateSignalMap(signalMap) {
    const schema = {
        beacons: Joi.array().items(Joi.object({
            beaconId: Joi.objectId().required(),
            signals: Joi.array().items(Joi.number().min(-200).max(100))
        }).required()).required(),
        roomId: Joi.objectId(),
        buildingId: Joi.objectId()
    };
    return Joi.validate(signalMap, schema);
}

exports.SignalMap = SignalMap;
exports.validate = validateSignalMap;
exports.signalMapSchema = signalMapSchema;
exports.estimateRoom = estimateRoom;
exports.alignedClientBeacons = alignedClientBeacons;
