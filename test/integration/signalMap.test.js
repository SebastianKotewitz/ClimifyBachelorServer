const {User} = require('../../models/user');
const {Building} = require('../../models/building');
const {Room} = require('../../models/room');
const {Beacon} = require('../../models/beacon');
const {SignalMap} = require('../../models/signalMap');
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../..');
const config = require('config');
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = require('chai').expect;

describe('/api/signalMaps', () => {
    let server;
    let user;
    let token;
    let roomId;
    let buildingId;
    let signals;
    let beaconId;
    let beacons;
    let signalMap;

    before(async () => {
        server = await app.listen(config.get('port'));
        await mongoose.connect(config.get('db'), {useNewUrlParser: true});
    });
    after(async () => {
        await server.close();
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        user = new User({role: 1});
        await user.save();
    });
    afterEach(async () => {
        await User.deleteMany();
        await SignalMap.deleteMany();
        await Room.deleteMany();
        await Beacon.deleteMany();
    });

    describe('POST /', () => {

        const exec = () => {
            return request(server)
              .post('/api/signalMaps')
              .set({'x-auth-token': token})
              .send({roomId, beacons, buildingId})
        };

        beforeEach(async () => {
            signals = [-40];


            const building = new Building({
                name: "222"
            });
            await building.save();

            let beacon = new Beacon({
                name: "hej", building: building.id,
                uuid: "f7826da6-4fa2-4e98-8024-bc5b71e0893b"
            });

            await beacon.save();

            buildingId = building.id;
            beaconId = beacon.id;

            const room = new Room({
                name: "222",
                building: building.id
            });
            await room.save();

            roomId = room.id;
            signalMap = {
                room: roomId,
                beacons: [{_id: beaconId, signals: [-39, -41]}]
            };

            beacons = [{
                beaconId,
                signals
            }];
            token = user.generateAuthToken();
        });

        it("Should not throw error", async () => {

            const building = new Building({name: "heeej"});
            await building.save();

            let room = new Room({building: building.id, name: "hej"});
            let room2 = new Room({building: building.id, name: "hej2"});
            await room.save();
            await room2.save();
            let beacon = new Beacon({name: "hej", building: building.id, uuid: "f7826da6-4fa2-4e98-8024-bc5b71e0893b"});
            let beacon2 = new Beacon({name: "hej", building: building.id, uuid: "f7826da6-4fa2-4e98-8024-bc5b71e0893b"});
            await beacon.save();
            await beacon2.save();


            let signalMap = new SignalMap({
                isActive: true,
                room: room.id,
                beacons: [
                    {
                        signals: [
                            -73,
                            -69.5,
                            -67
                        ],
                        _id: beacon.id
                    },
                    {
                        signals: [
                            -64,
                            -70
                        ],
                        _id: beacon2.id
                    }
                ],
                __v: 0
            });
            await signalMap.save();
            let signalMap2 = new SignalMap({
                isActive: true,
                room: room2.id,
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
                ]
            });
            await signalMap2.save();


            const requestFromChril = {
                buildingId: building.id,
                beacons: [
                    {beaconId: beacon.id, signals: [-62]}, {
                        beaconId: beacon2.id,
                        signals: [-70]
                    }]
            };

            const res = await request(server)
              .post('/api/signalMaps')
              .set({'x-auth-token': token})
              .send(requestFromChril);
        });


        it("Should return 400 if neither roomId or buildingId provided", async () => {
            buildingId = undefined;
            roomId = undefined;
            await expect(exec()).to.be.rejectedWith("Bad Request");
        });


        it("Should return new signalmap with one length array of beacons", async () => {
            const res = await exec();
            expect(res.body.beacons.length).to.equal(1);
        });

        it("Should have reference to room", async () => {
            const res = await exec();
            expect(res.body.room).to.equal(roomId.toString());
        });

        it("Should return 400 if one of the beacons doesn't exist in the system", async () => {
            beacons = [{
                beaconId: mongoose.Types.ObjectId(),
                signals
            }];

            await expect(exec()).to.be.rejectedWith("Bad Request");
        });


        it("Should return 400 if one of the rssi arrays did not have the same length as the other's", async () => {
            let newBeacon = new Beacon({
                name: "hejj", building: buildingId,
                uuid: "f7826da6-4fa2-4e98-8024-bc5b71e0893b"
            });
            beacons.push({
                beaconId: mongoose.Types.ObjectId(),
                signals: [10, 23, 60]
            });
            await expect(exec()).to.be.rejectedWith("Bad Request");
        });

        it("Should set isActive to false by default if room not provided", async () => {
            const signalMap = new SignalMap({
                beacons: [{
                    _id: beaconId,
                    signals: [39, 41]
                }],
                room: roomId,
                isActive: true
            });
            await signalMap.save();

            roomId = undefined;
            const res = await exec();
            expect(res.body.isActive).to.be.false;
        });

        it("Should set isActive to true if roomId provided", async () => {
            const res = await exec();
            expect(res.body.isActive).to.be.true;
        });

        it("Should estimate room if roomId not provided", async () => {
            const signalMap = new SignalMap({
                beacons: [{
                    _id: beaconId,
                    signals: [39, 41]
                }],
                room: roomId,
                isActive: true
            });
            await signalMap.save();
            roomId = undefined;
            const res = await exec();
            expect(res.body.room).to.equal(signalMap.room.toString());
        });

        it("Should estimate correct room when nearest neighbor is a tie", async () => {
            let beacon = new Beacon({
                name: "hejjj", building: buildingId,
                uuid: "f7826da6-4fa2-4e98-8024-bc5b71e0894b"
            });
            await beacon.save();

            let room2 = new Room({
                building: buildingId,
                name: "hej"
            });
            await room2.save();

            await SignalMap.deleteMany();
            const signalMaps = [new SignalMap({
                beacons: [{
                    _id: beaconId,
                    signals: [-39, -41]
                }, {
                    _id: beacon.id,
                    signals: [-59, -61]
                }],
                room: roomId,
                isActive: true
            }), new SignalMap({
                beacons: [{
                    _id: beaconId,
                    signals: [-59, -61]
                }, {
                    _id: beacon.id,
                    signals: [-39, -41]
                }],
                room: room2.id,
                isActive: true
            }),];

            for (let i = 0; i < signalMaps.length; i++) {
                await signalMaps[i].save();
            }

            beacons = [{
                beaconId: beaconId,
                signals: [-40]
            }, {
                beaconId: beacon.id,
                signals: [-60]
            }];


            let roooom = roomId;
            roomId = undefined;
            const res = await exec();
            expect(res.body.room.toString()).to.equal(roooom);
        });

        it("Should not throw error if beacon was in client beacons array but not in servermap", async () => {
            let beacon = new Beacon({
                name: "hejjj", building: buildingId,
                uuid: "f7826da6-4fa2-4e98-8024-bc5b71e0894b"
            });
            await beacon.save();

            let room2 = new Room({
                building: buildingId,
                name: "hej"
            });
            await room2.save();

            await SignalMap.deleteMany();
            const signalMaps = [new SignalMap({
                beacons: [{
                    _id: beaconId,
                    signals: [-39, -41]
                }, {
                    _id: beacon.id,
                    signals: [-59, -61]
                }],
                room: roomId,
                isActive: true
            }), new SignalMap({
                beacons: [{
                    _id: beaconId,
                    signals: [-59, -61]
                }, {
                    _id: beacon.id,
                    signals: [-39, -41]
                }],
                room: room2.id,
                isActive: true
            }),];

            for (let i = 0; i < signalMaps.length; i++) {
                await signalMaps[i].save();
            }

            let beaconOnlyFromClient = new Beacon({
                name: "hejjj", building: buildingId,
                uuid: "f7826da6-4fa2-4e98-8024-bc5b71e08912"
            });
            await beaconOnlyFromClient.save();

            beacons = [{
                beaconId: beaconId,
                signals: [-40]
            }, {
                beaconId: beacon.id,
                signals: [-60]
            }, {
                beaconId: beaconOnlyFromClient.id,
                signals: [-20]
            }];

            let roooom = roomId;
            roomId = undefined;
            const res = await exec();
            expect(res.body.room.toString()).to.equal(roooom);
        });

        it("Should return 400 if no signalmap was posted an a room estimation was requested", async () => {
            await SignalMap.deleteMany();
            roomId = undefined;
            await expect(exec()).to.be.rejectedWith("Bad Request");
        });

    });

    describe("PATCH /confirm-room/:id Confirm room", () => {

        let signalMapId;
        const exec = () => {
            return request(server)
              .patch('/api/signalMaps/confirm-room/' + signalMapId)
              .set({'x-auth-token': token})
              .send({roomId, beacons, buildingId})
        };

        beforeEach(async () => {
            signals = [40];

            beaconId = mongoose.Types.ObjectId();
            buildingId = mongoose.Types.ObjectId();

            const room = new Room({
                name: "222",
                building: buildingId
            });
            await room.save();

            roomId = room.id;

            signalMap = new SignalMap({
                room: roomId,
                beacons: [{_id: beaconId, signals: [39, 41]}]
            });
            signalMapId = signalMap.id;

            await signalMap.save();

            token = user.generateAuthToken();
        });

        it("Should return updated signal map with isValid = true", async () => {
            const signalMap = await exec();
            expect(signalMap.body.isActive).to.be.true;
        });

        it("Should return 404 if signal map did not exist", async () => {
            signalMapId = mongoose.Types.ObjectId();
            await expect(exec()).to.be.rejectedWith("Not Found");
        });
    });


    describe(" GET / ", () => {

        const exec = () => {
            return request(server)
              .get('/api/signalMaps')
              .set({'x-auth-token': token})
        };

        beforeEach(async () => {
            signals = [40];

            beaconId = mongoose.Types.ObjectId();
            buildingId = mongoose.Types.ObjectId();

            const room = new Room({
                name: "222",
                building: buildingId
            });
            await room.save();

            roomId = room.id;

            signalMap = new SignalMap({
                room: roomId,
                beacons: [{_id: beaconId, signals: [39, 41]}]
            });

            await signalMap.save();

            beacons = [{
                beaconId,
                signals
            }];
            token = user.generateAuthToken();
        });

        it("Should return array with correct beaconIds ", async () => {
            const res = await exec();
            expect(res.body[0].beacons[0]._id).to.equal(beaconId.toString());
        });

    })
});
