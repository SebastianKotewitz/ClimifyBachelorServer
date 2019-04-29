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
    },
    isActive: {
        type: Boolean,
        default: false
    }
});

function alignedClientBeacons(serverBeacons, clientBeacons) {

    const alignedBeacons = new Array(serverBeacons.length);

    for (let i = 0; i < clientBeacons.length; i++) {
        const index = serverBeacons.findIndex(beacon => beacon._id.toString() === clientBeacons[i].beaconId.toString());
        alignedBeacons[index] = clientBeacons[i];
    }


    return alignedBeacons;
}

function updateNearestNeighbors(nearestNeighbors, newNeighbor) {

    const index = findIndexOfMaxDistanceNeighbor(nearestNeighbors);
    if (!nearestNeighbors[index] || newNeighbor.distance < nearestNeighbors[index].distance)
        nearestNeighbors[index] = newNeighbor;

    return nearestNeighbors;
}

function findIndexOfMaxDistanceNeighbor(nearestNeighbors) {
    let maxDistance = -1;
    let maxDistIndex = -1;

    for (let i = 0; i < nearestNeighbors.length; i++) {
        if (!nearestNeighbors[i])
            return i;

        if (nearestNeighbors[i].distance > maxDistance) {
            maxDistance = nearestNeighbors[i].distance;
            maxDistIndex = i;
        }
    }

    return maxDistIndex;
}

function estimateRoom(beacons, signalMaps, k) {

    if (!k)
        k = 2;

    
    let nearestNeighbors = new Array(k);
    console.log(nearestNeighbors);
    nearestNeighbors[0] = {
        room: signalMaps[0].room,
        distance: Number.MAX_SAFE_INTEGER
    };

    console.log("nearest: ", nearestNeighbors);

    for (let i = 0; i < signalMaps.length; i++) {

        const alignedBeacons = alignedClientBeacons(signalMaps[i].beacons, beacons);

        for (let j = 0; j < alignedBeacons[0].signals.length; j++) {

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

            nearestNeighbors = updateNearestNeighbors(nearestNeighbors, {
                room: signalMaps[i].room,
                distance
            });
        }
    }

    console.log("nearest", nearestNeighbors);
    return roomOfMostNeighbors(nearestNeighbors);
}

function roomOfMostNeighbors(nearestNeighbors) {
    const roomCount = [];
    const roomIds = new Set();
    const minDistances = [];

    for (let i = 0; i < nearestNeighbors.length; i++) {
        let roomAmount = roomIds.size;

        roomIds.add(nearestNeighbors[i].room.toString());
        let addedIndex;
        if (roomAmount !== roomIds.size) {
            roomCount.push(0);
            minDistances.push(nearestNeighbors[i].distance);
            addedIndex = roomCount.length - 1;
        } else {
            addedIndex = [...roomIds].indexOf(nearestNeighbors[i].room.toString());
            roomCount[addedIndex]++;

            if (minDistances[addedIndex] > nearestNeighbors[i].distance)
                minDistances[addedIndex] = nearestNeighbors[i].distance;
        }
    }
    const maxCount = Math.max(...roomCount);

    const roomIdArray = Array.from(roomIds);
    const indexOfMax = roomCount.indexOf(maxCount);

    let minDistIndex = -1;
    let minDistance = Number.MAX_SAFE_INTEGER;


    if (roomCount.filter(elem => elem === maxCount).length > 1) {
        for (let i = 0; i < roomCount.length; i++) {
            if (roomCount[i] === maxCount && minDistance > minDistances[i]) {
                minDistance = minDistances[i];
                minDistIndex = i;
            }
        }
        return roomIdArray[minDistIndex]
    } else {
        return roomIdArray[indexOfMax];
    }


}

const SignalMap = mongoose.model('SignalMap', signalMapSchema);

function validateSignalMap(signalMap) {
    const schema = {
        beacons: Joi.array().items(Joi.object({
            beaconId: Joi.objectId().required(),
            signals: Joi.array().items(Joi.number().min(-200).max(0))
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
exports.updateNearestNeighbors = updateNearestNeighbors;
exports.findIndexOfMaxDistanceNeighbor = findIndexOfMaxDistanceNeighbor;
exports.roomOfMostNeighbors = roomOfMostNeighbors;
