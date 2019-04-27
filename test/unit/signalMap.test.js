const {estimateRoom, alignedClientBeacons} = require('../../models/signalMap');
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

    const exec = () => {
        return estimateRoom(registeredBeacons, signalMaps)
    };

    beforeEach(() => {

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
        signalMaps = [signalMap1, signalMap2]
    });

    it("Should estimate room to be signalMap 1", () => {
        const roomId = exec();
        expect(roomId.toString()).to.equal(signalMap1.room.toString());
    });

    it("Should also work with reversed order", () => {
        signalMaps = [signalMap2, signalMap1];
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
