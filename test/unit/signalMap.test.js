const {
    estimateRoom, alignedClientBeacons,
    updateNearestNeighbors, findIndexOfMaxDistanceNeighbor,
    roomOfMostNeighbors
} = require('../../models/signalMap');
const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-as-promised'));
const mongoose = require('mongoose');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);


describe('Estimate room', () => {


    let registeredBeacons;
    let signalMaps;
    let signalMap1;
    let signalMap2;
    let signalMap3;
    let k;

    const exec = () => {
        return estimateRoom(registeredBeacons, signalMaps, k)
    };

    beforeEach(() => {
        k = 3;
        registeredBeacons = [{
            beaconId: mongoose.Types.ObjectId(),
            signals: [20]
        }, {
            beaconId: mongoose.Types.ObjectId(),
            signals: [10]
        }];


        signalMap1 = {
            beacons: [
                {
                    _id: registeredBeacons[0].beaconId,
                    signals: [19, 21]
                },
                {
                    _id: registeredBeacons[1].beaconId,
                    signals: [9, 11]
                }
            ],
            room: mongoose.Types.ObjectId()
        };

        signalMap2 = {
            beacons: [
                {
                    _id: registeredBeacons[0].beaconId,
                    signals: [50, 55]
                },
                {
                    _id: registeredBeacons[1].beaconId,
                    signals: [1, 2]
                }
            ],
            room: mongoose.Types.ObjectId()
        };

        signalMap3 = {
            beacons: [
                {
                    _id: registeredBeacons[0].beaconId,
                    signals: [100, 102]
                },
                {
                    _id: registeredBeacons[1].beaconId,
                    signals: [300, 302]
                }
            ],
            room: mongoose.Types.ObjectId()
        };

        signalMaps = [signalMap1, signalMap2, signalMap3]
    });

    it("Should estimate room to be signalMap 1", () => {
        const roomId = exec();
        expect(roomId.toString()).to.equal(signalMap1.room.toString());
    });

    it("Should also work with reversed order", () => {
        signalMaps = [signalMap3, signalMap2, signalMap1];
        const roomId = exec();
        expect(roomId.toString()).to.equal(signalMap1.room.toString());
    });

    it("Should find correct room with 3 signalMaps", () => {
        let signalMap3 = {
            beacons: [
                {
                    _id: registeredBeacons[0].beaconId,
                    signals: [18, 22]
                },
                {
                    _id: registeredBeacons[1].beaconId,
                    signals: [8, 12]
                }
            ],
            room: mongoose.Types.ObjectId()
        };
        signalMaps = [signalMap1, signalMap3, signalMap2];

        const roomId = exec();
        expect(roomId.toString()).to.equal(signalMap1.room.toString());
    });

    it("Should return correct room when client beacons length is shorter than server beacon length", () => {

        signalMap1.beacons.push({
            _id: registeredBeacons[0].beaconId,
            signals: [50, 55]
        });
        signalMap2.beacons.push({
            _id: registeredBeacons[0].beaconId,
            signals: [50, 55]
        });

        const roomId = exec();
        expect(roomId.toString()).to.equal(signalMap1.room.toString());
    });

    it("Should also locate the right room when client posts more beacons than server has", () => {
        registeredBeacons.push({
            beaconId: mongoose.Types.ObjectId(),
            signals: [50, 55]
        });

        const roomId = exec();
        expect(roomId.toString()).to.equal(signalMap1.room.toString());
    });

    it("Should estimate the correct room even though the nearest point is for another room", () => {
        // Define a third signal map to point to the same room as signalMap2
        let signalMap3 = {
            beacons: [
                {
                    _id: registeredBeacons[0].beaconId,
                    signals: [50, 55]
                },
                {
                    _id: registeredBeacons[1].beaconId,
                    signals: [1, 2]
                }
            ],
            room: signalMap2.room
        };

        signalMaps.push(signalMap3);
        for (let i = 0; i < signalMaps.length; i++) {

            console.log(signalMaps[i]);
            console.log(signalMaps[i].beacons[0].signals);
            console.log(signalMaps[i].beacons[1].signals);
        }
        // console.log(signalMaps);

        // should find 3 points. the closest point to room A, but the two others point to room B.
        // Should therefore estimate the room to be room B
        const res = exec();
        expect(res.toString()).to.equal(signalMap3.room.toString());

    });

    it("Should throw ", () => {
        signalMaps = [
            {
                isActive: true,
                _id: "5cc6d646032e5567cf4e31aa",
                room: "5cc6cd0e785ba2674dbc7482",
                beacons: [
                    {
                        signals: [
                            -73,
                            -69.5,
                            -67
                        ],
                        _id: "5cc6d646032e5567cf4e31ac"
                    },
                    {
                        signals: [
                            -64,
                            -70
                        ],
                        _id: "5cc6d646032e5567cf4e31ab"
                    }
                ],
                __v: 0
            }
        ];

        registeredBeacons = [
            {signals: [-78], beaconId: "5ca4b1776a3ec26dfd07362d"},
            {signals: [-70], beaconId: "5ca45b286a3ec26dfd0735b5"}
        ];

        const res = exec();
        expect(res).to.equal("5cc6cd0e785ba2674dbc7482")
    });

    describe("update nearest neighbors", () => {
        let nearestNeighbors;
        let newNeighbor;

        beforeEach(() => {
            newNeighbor = {
                room: mongoose.Types.ObjectId(),
                distance: 3
            };

            nearestNeighbors = [{
                room: mongoose.Types.ObjectId(),
                distance: 1
            }, {
                room: mongoose.Types.ObjectId(),
                distance: 2
            }, {
                room: mongoose.Types.ObjectId(),
                distance: 4
            }]
        });

        const exec = () => {
            return updateNearestNeighbors(nearestNeighbors, newNeighbor);
        };

        it("Should return array with new neighbor", () => {
            const nearestNeighbors = exec();
            const index = nearestNeighbors.findIndex(elem => {
                return elem.room === newNeighbor.room
            });

            expect(index).to.not.equal(-1);
        });

        it("should return non-updated array when newNeighbor is further away", () => {
            const nearestNeighbors = exec();
            newNeighbor = {distance: 10, room: mongoose.Types.ObjectId()}

            const index = nearestNeighbors.findIndex(elem => elem.room === newNeighbor.room);

            expect(index).to.equal(-1);
        })
    });

    describe("Find the room that most neighbors point to", () => {
        let nearestNeighbors;
        let roomId1;
        let roomId2;
        beforeEach(() => {
            roomId1 = mongoose.Types.ObjectId();
            roomId2 = mongoose.Types.ObjectId();

            nearestNeighbors = [{
                room: roomId1,
                distance: 1
            }, {
                room: roomId2,
                distance: 2
            }, {
                room: roomId1,
                distance: 4
            }]
        });

        const exec = () => {
            return roomOfMostNeighbors(nearestNeighbors);
        };


        it("Should return the roomId that most neighbors point to", () => {
            const roomId = exec();
            expect(roomId).to.equal(roomId1.toString());
        });

        it("Should return correct roomId when room2 has most neighbors", () => {
            nearestNeighbors.push({
                room: roomId2,
                distance: 2
            });

            nearestNeighbors.push({
                  room: roomId2,
                  distance: 2
              }
            );
            const roomId = exec();
            expect(roomId.toString()).to.equal(roomId2.toString());
        });

        it("If more neighbors have max count the method should return the element with the lowest distance", () => {
            nearestNeighbors.push({
                room: roomId2,
                distance: 2
            });

            let newId = mongoose.Types.ObjectId();
            nearestNeighbors.push({
                room: newId,
                distance: 10
            });
            nearestNeighbors.push({
                room: newId,
                distance: 0
            });


            const roomId = exec();
            expect(roomId).to.equal(newId.toString());
        });
    });

    describe("find index of max distance neighbor", () => {
        let nearestNeighbors;

        beforeEach(() => {
            nearestNeighbors = [{
                room: mongoose.Types.ObjectId(),
                distance: 1
            }, {
                room: mongoose.Types.ObjectId(),
                distance: 2
            }, {
                room: mongoose.Types.ObjectId(),
                distance: 4
            }, {
                room: mongoose.Types.ObjectId(),
                distance: 3
            }]
        });

        const exec = () => {
            return findIndexOfMaxDistanceNeighbor(nearestNeighbors)
        };

        it("Should return correct index of max distance", () => {
            const index = exec();
            expect(index).to.equal(2);
        });

        it("Should return index of undefined neighbor", () => {
            nearestNeighbors[1] = undefined;
            const index = exec();
            expect(index).to.equal(1);

        })

    });

    describe('align arrays', () => {

        let serverBeacons;
        let clientBeacons;

        beforeEach(() => {
            let id1 = mongoose.Types.ObjectId();
            let id2 = mongoose.Types.ObjectId();

            serverBeacons = [
                {
                    _id: id1,
                    signals: []
                },
                {
                    _id: id2,
                    signals: []
                }
            ];

            clientBeacons = [
                {
                    beaconId: id2,
                    signals: []
                },
                {
                    beaconId: id1,
                    signals: []
                }
            ]
        });

        const exec = () => {
            return alignedClientBeacons(serverBeacons, clientBeacons);
        };


        it("should return aligned beacons array", () => {

            const aligned = exec();
            expect(aligned[0].beaconId).to.equal(serverBeacons[0]._id);
        });
    });

});
