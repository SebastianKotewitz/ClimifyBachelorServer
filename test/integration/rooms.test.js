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
        user = new User();
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

        const exec = () => {
            return request(server)
                .post('/api/rooms')
                .send({location, buildingId: building._id, name});
        };

        beforeEach(async () => {
            building = new Building({name: '324'});
            name = '324';
            location = '222';

            await building.save();
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

    });


    describe('GET /', () => {
        let building;
        let room;

        beforeEach(async () => {
            building = new Building({name: '324'});

            room = new Room({name: "222", location: "123", building: building._id});

            await building.save();
            await room.save();
        });
        const exec = () => {
            return request(server)
                .get('/api/rooms')
                .set('userId', user._id);
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