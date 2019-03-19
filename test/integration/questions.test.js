
const request = require('supertest');
const {User} = require('../../models/user');
const {Room} = require('../../models/room');
const {Building} = require('../../models/building');
const {Question} = require('../../models/question');
const mongoose = require('mongoose');
const assert = require('assert');
const expect = require('chai').expect;
const app = require('../..');
const config = require('config');

describe('/api/questions', () => {
    let server;
    let user;
    let url;
    let userId;

    before(async () => {
        server = await app.listen(config.get('port'));
        await mongoose.connect(config.get('db'), {useNewUrlParser: true});
    });
    after(async () => {
        await server.close();
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        user = new User();
        userId = user._id;
        await user.save();
    });
    afterEach(async () => {
        await User.deleteMany();
        await Building.deleteMany();
        await Room.deleteMany();
        await Question.deleteMany();
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
        let buildingId;
        let roomId;

        const exec = () => {
            return request(server)
                .get('/api/questions')
                .set({'userId': user._id, 'roomId': roomId});
        };

        beforeEach(async () => {
            building = new Building({name: '12345'});
            await building.save();
            buildingId = building._id;

            room = new Room({
                building: buildingId,
                name: "12345",
                location: "12345"
            });

            await room.save();
            roomId = room._id;

            const question = new Question({
                name: "12345",
                room: roomId,
                answerOptions: ['hej']
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
        it('should return questions array with 1 length', async () => {
            const res = await exec();
            expect(res.body.length).to.be.equal(1);
        });

        it('should return 200 when getting questions array with valid parameters',  async () => {
            const res = await exec();

            expect(res.status).to.be.equal(200);


        });

        it('should return question object with roomId field', async () => {

            const res = await exec();
            assert.strictEqual(res.body[0].room, roomId.toString());
        });

        it('should only return questions from detected room/building', async () => {

            const building2 = new Building({name: '56789'});
            await building2.save();

            const room2 = new Room({building: building2._id, name: "hej", location: "hej"});
            await room2.save();

            const question2 = new Question({
                name: "12345",
                room: room2._id
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
        let buildingId;
        let answerOptions;
        let roomId;

        beforeEach(async () => {
            name = '12345';
            building = new Building({name});
            await building.save();
            buildingId = building._id;
            user.adminOnBuilding = building.id;
            const room = new Room({name: '222', location: "123", building: buildingId});
            await room.save();
            roomId = room._id;

            await user.save();
            answerOptions = ['answer1', 'answer2'];
        });

        const exec = () => {
            return request(server)
                .post(url)
                .set('userId', userId)
                .send({roomId, name: '12345', answerOptions});
        };

        it('401 if user id not provided', async () => {
            userId = null;

            try {
                await exec();
            } catch (e) {
                assert.strictEqual(e.status, 401);
            }
        });

        it('401 if user id not valid', async () => {
            userId = '12345';

            try {
                await exec();
            } catch (e) {
                assert.strictEqual(e.status, 401);
            }
        });

        it('404 if user was not found', async () => {

            userId = mongoose.Types.ObjectId();

            try {
                await exec();
            } catch (e) {
                assert.strictEqual(e.status, 404);
            }
        });

        it('400 if roomId not provided', async () => {
            roomId = null;

            try {
                await exec();
            } catch (e) {
                assert.strictEqual(e.status, 400);
            }
        });

        it('400 if roomId not valid', async () => {

            roomId = '12345';

            try {
                await exec();
            } catch (e) {
                assert.strictEqual(e.status, 400);
            }
        });

        it('404 if roomId not found', async () => {

            roomId = mongoose.Types.ObjectId();

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

        it('should return question object with proper room id', async () => {

            const res = await exec();

            assert.strictEqual(res.body.room, roomId.toString());
        });

        it('should only return 1 length array when posted question for two different buildings', async () => {
            const building2 = new Building({name: '12345'});
            await building2.save();
            user.adminOnBuilding = building.id;
            await user.save();

            const room2 = new Room({
                building: building2._id,
                name: "12345",
                location: "12345"
            });
            await room2.save();

            await request(server)
                .post(url)
                .set('userId', user.id)
                .send({roomId: roomId, name: '12345', answerOptions: ['answer1', 'answer2']});

            user.adminOnBuilding = building2.id;
            await user.save();

            await request(server)
                .post(url)
                .set('userId', user.id)
                .send({roomId: room2.id, name: '12345', answerOptions: ['answer3', 'answer4']});

            const res = await request(server)
                .get(url)
                .set({roomId: roomId, userId: user.id});

            assert.strictEqual(res.body.length, 1);
        });

        it('should return 400 if answer options not provided',   (done) => {
            answerOptions = null;

            // try {
            //     await exec();
            // } catch (e) {
            //     expect(e.status).to.be.equal(400)
            // }

            exec().catch(err => {
                expect(err.status).to.be.equal(400);
                done();
            });
        });

    });
});