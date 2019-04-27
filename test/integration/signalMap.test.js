const {User} = require('../../models/user');
const {Room} = require('../../models/room');
const {SignalMap} = require('../../models/signalMap');
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../..');
const config = require('config');
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = require('chai').expect;

describe('/api/feedback', () => {
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
    });

    describe(' POST /', () => {

        const exec = () => {
            return request(server)
              .post('/api/signalMaps')
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

            signalMap = {
                room: roomId,
                beacons: [{_id: beaconId, signals: [39, 41]}]
            };

            beacons = [{
                beaconId,
                signals
            }];
            token = user.generateAuthToken();
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

        it("Should not be set to inactive by default if room not provided", async () => {
            const signalMap = new SignalMap({
                beacons: [{
                    _id: beaconId,
                    signals: [39, 41]
                }],
                room: roomId,
            });
            await signalMap.save();

            roomId = undefined;
            const res = await exec();
            expect(res.body.isActive).to.not.be.false;
        });

        it("Should estimate room if roomId not provided", async () => {
            roomId = undefined;
            const res = await exec();

            expect(res.body.room).to.equal(roomId);
        });

    });

});
