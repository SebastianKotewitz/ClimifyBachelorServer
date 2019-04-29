const {User} = require('../../models/user');
const {Building} = require('../../models/building');
const {Room} = require('../../models/room');
const request = require('supertest');
let assert = require('assert');
const app = require('../..');
let server;
const config = require('config');
const mongoose = require('mongoose');
const logger = require('../../startup/logger');
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = require('chai').expect;


describe('/api/rooms', () => {
    let user;

    before(async () => {
        server = app.listen(config.get('port'));
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
        await Room.deleteMany();
        await Building.deleteMany();
    });


    describe('POST /', () => {

        let building;
        let location;
        let name;
        let body;
        let token;

        const exec = () => {
            return request(server)
                .post('/api/rooms')
                .set("x-auth-token", token)
                .send({buildingId: building._id, name});
        };

        beforeEach(async () => {
            building = new Building({name: '324'});
            name = '324';


            await building.save();

            token = user.generateAuthToken();
        });

        it("should return 400 if no token provided", async () => {
            token = null;
            await expect(exec()).to.be.rejectedWith("Bad Request");
        });

        it("Should return 403 if user not authorized with login role >= 1", async () => {
            user.role = 0;
            await user.save();
            await expect(exec()).to.be.rejectedWith("Forbidden");
        });

        it('should return room with proper building id', async () => {
            try {
                const res = await exec();
                expect(res.body.building).to.equal(building.id);
            } catch (e) {
                logger.error(e.response.text);
                throw e;
            }
        });

        // 400 if random parameter in body is passed
        it('400 if random parameter in body is passed', async () => {
            body = {hej: "12345"};

            try {
                await exec();
            } catch (e) {
                assert.strictEqual(e.status, 400);
            }

        });


        it('should return 400 if name not set', async () => {
            name = null;

            try {
                await exec();
            } catch (e) {
                return expect(e.status).to.equal(400);
            }
            throw new Error('should have thrown error');
        });

        it("Should return 403 if user not admin on building", async () => {


        });

    });


    describe("GET rooms in building /fromBuilding/:id", () => {
        let building;
        let buildingId;
        let room;
        let token;

        beforeEach(async () => {
            building = new Building({name: '324'});
            buildingId = building.id;
            room = new Room({name: "222", location: "123", building: building._id});
            let room2 = new Room({name: "221", location: "456", building: mongoose.Types.ObjectId()});
            token = user.generateAuthToken();
            await building.save();
            await room.save();
            await room2.save();
        });

        const exec = () => {
            return request(server)
              .get('/api/rooms/fromBuilding/' + buildingId)
              .set('x-auth-token', token);
        };

        it("Should only return 1 room", async () => {
            const res = await exec();
            expect(res.body.length).to.equal(1);
        });
    });

    describe('GET /', () => {
        let building;
        let room;
        let token;

        beforeEach(async () => {
            building = new Building({name: '324'});

            room = new Room({name: "222", location: "123", building: building._id});
            token = user.generateAuthToken();
            await building.save();
            await room.save();
        });
        const exec = () => {
            return request(server)
                .get('/api/rooms')
                .set('x-auth-token', token);
        };


        it('should return array with length 2 of rooms when 2 rooms are posted', async () => {
            const room2 = new Room({name: "222", location: "123", building: building._id});
            await room2.save();

            try {
                const res = await exec();
                expect(res.body.length).to.equal(2);
            } catch (e) {
                logger.error(e);
                throw e;
            }
        });

    });
});
