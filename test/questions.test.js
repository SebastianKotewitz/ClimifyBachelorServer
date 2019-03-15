
const request = require('supertest');
const {User} = require('../models/user');
const {Room} = require('../models/room');
const {Building} = require('../models/building');
const {Question} = require('../models/question');
const mongoose = require('mongoose');
const assert = require('assert');


describe('/api/questions', () => {
    let server;
    let user;
    let url;

    beforeEach(async () => {
        server = require('../index');
        user = new User();
        await user.save();
    });

    afterEach(async () => {
        await User.deleteMany();
        await Question.deleteMany();
        await Building.deleteMany();
        await Room.deleteMany();
        await server.close();
    });


    describe('GET /', () => {

        // should return 401 if userId not set in header
        // 401 if wrong type of userId sent
        // 404 if user was not found
        // should return 400 if roomId not set in header
        // 404 if room not found
        // Return array of questions
        let room;
        let building;

        const exec = () => {
            return request(server)
                .get('/api/questions')
                .set({'userId': user._id, 'roomId': room._id});
        };

        beforeEach(async () => {
            building = new Building({name: '12345'});
            await building.save();

            room = new Room({
                building: building.id,
                name: "12345",
                location: "12345"
            });
            await room.save();

            const question = new Question({
                name: "12345",
                building: building._id
            });

            await question.save();
        });

        it('Should return 401 if userId not provided',async () => {
            user._id = null;

            try{
                await exec();
            } catch (e) {
                assert.strictEqual(e.status, 401);
            }

        });

        it('401 if wrong userId format sent', async () => {
            user._id = '12345';
            try{
                await exec();
            }catch (e) {
                assert.strictEqual(e.status, 401);
            }
        });

        it('404 if user was not found', async () => {
            user = new User();

            try{
                await exec();
            }catch (e) {
                assert.strictEqual(e.status, 404);
            }

        });

        it('400 if roomId not provided',  async () => {
            room._id = null;

            try{
                await exec();
            }catch (e) {
                assert.strictEqual(e.status, 400);
            }

        });

        it('400 if roomId was wrong format', async () => {

            room._id = '12345';
            try {
                await exec();
            }catch (e) {
                assert.strictEqual(e.status, 400);
            }
        });

        it('404 if room was not found', async () => {

            room._id = mongoose.Types.ObjectId();

            try {
                await exec();
            }catch (e) {
                assert.strictEqual(e.status, 404);
            }
        });

        it('should return question object with roomId field', async () => {

            const res = await exec();
            assert.strictEqual(res.body[0].building, building.id);
        });

        it('should only return questions from detected room/building', async () => {

            const building2 = new Building({name: '56789'});
            await building2.save();

            const question2 = new Question({
                name: "12345",
                building: building2._id
            });

            await question2.save();

            const res = await exec();
            assert.strictEqual(res.body.length, 1);
        });
    });

    describe('POST /', () => {

        url = '/api/questions';
        // Post new question as admin on building
        // 401 user id not provided
        // 401 userId not valid
        // 404 user not found
        // 400 buildingId not provided
        // 400 name not provided
        // 400 buildingId not valid
        // 404 building not found
        // 403 user not admin on building
        // returns new question with provided building id
        let building;
        let name;

        beforeEach(async () => {
            name = '12345';
            building = new Building({name});
            await building.save();
            user.adminOnBuilding = building.id;
            await user.save();
        });

        const exec = () => {
            return request(server)
                .post(url)
                .set('userId', user.id)
                .send({buildingId: building.id, name: '12345'});
        };

        it('401 if user id not provided', async () => {
            user.id = null;

            try {
            await exec();
            } catch (e) {
                assert.strictEqual(e.status, 401);
            }
        });

        it('401 if user id not valid', async () => {
            user.id = '12345';

            try {
                await exec();
            } catch (e) {
                assert.strictEqual(e.status, 401);
            }
        });

        it('404 if user was not found', async () => {

            user.id = mongoose.Types.ObjectId();

            try {
                await exec();
            } catch (e) {
                assert.strictEqual(e.status, 404);
            }
        });

        it('400 if buildingId not provided', async () => {
            building.id = null;

            try {
                await exec();
            } catch (e) {
                assert.strictEqual(e.status, 400);
            }
        });

        it('400 if buildingId not valid', async () => {

            building.id = '12345';

            try {
                await exec();
            } catch (e) {
                assert.strictEqual(e.status, 400);
            }
        });

        it('404 if buildingId not found', async () => {

            building.id = mongoose.Types.ObjectId();

            try {
                await exec();
            } catch (e) {
                assert.strictEqual(e.status, 404);
            }
        });

        it('400 if name not provided', async () => {
            name = null;

            try {
                await exec();
            } catch (e) {
                assert.strictEqual(e.status, 400);
            }

        });

        it('403 if user not admin on building', async () => {
            const admin = new User();
            admin.adminOnBuilding = building.id;
            await admin.save();

            try {
                await exec();
            } catch (e) {
                assert.strictEqual(e.status, 403);
            }
        });

        it('should return question object with proper building id', async () => {

            const res = await exec();

            assert.strictEqual(res.body.building, building.id);
        });

        it('should only return 1 length array when posted question for two different buildings', async () => {
            const building2 = new Building({name: '12345'});
            await building2.save();
            user.adminOnBuilding = building.id;
            await user.save();

            const room = new Room({
                building: building._id,
                name: "12345",
                location: "12345"
            });
            await room.save();

            await request(server)
                .post(url)
                .set('userId', user.id)
                .send({buildingId: building.id, name: '12345'});

            user.adminOnBuilding = building2.id;
            await user.save();

            await request(server)
                .post(url)
                .set('userId', user.id)
                .send({buildingId: building2.id, name: '12345'});

            const res = await request(server)
                .get(url)
                .set({roomId: room.id, userId: user.id});

            assert.strictEqual(res.body.length, 1);
        });

    });
});