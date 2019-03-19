const {User} = require('../../models/user');
const {Building} = require('../../models/building');
const {Question} = require('../../models/question');
const {Feedback} = require('../../models/feedback');
const {Room} = require('../../models/room');
const logger = require('../../startup/logger');
const expect = require('chai').expect;
const request = require('supertest');
const mongoose = require('mongoose');
const assert = require('assert');
const app = require('../..');
const config = require('config');

describe('/api/feedback', () => {
    let server;
    let user;
    let room;
    let questions;
    let question;
    let building;
    let userId;
    let roomId;

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
        await user.save();
    });
    afterEach(async () => {
        await User.deleteMany();
        await Building.deleteMany();
        await Room.deleteMany();
        await Question.deleteMany();
    });

    describe(' POST /', () => {

        const exec = () => {
            return request(server)
                .post('/api/feedback')
                .set({'userId': userId})
                .send({roomId, questions})
        };

        beforeEach(async () => {
            building = new Building({name: '324'});
            await building.save();

            userId = user._id;

            room = new Room({
                name: '123',
                location: '123',
                building: building._id
            });
            await room.save();

            roomId = room._id;

            question = new Question({name: '123', room: room._id, answerOptions: ['hej']});
            // questions = [question];
            await question.save();
            questions = [{_id: question.id, answer: 'hej'}]

        });

        it('should return 401 if userId not provided', async () => {
            userId = null;

            try {
                await exec();
            } catch (e) {
                assert.strictEqual(e.status, 401)
                // expect(e.status).to.equal(401);
            }
        });

        it('should return 401 if invalid userId', async () => {
            userId = '123';

            try {
                await exec();
            } catch (e) {
                expect(e.status).to.equal(401);
            }
        });


        it('404 if user with userId not found', async () => {
            userId = mongoose.Types.ObjectId();
            try {
                await exec();
            } catch (e) {
                expect(e.status).to.equal(404);
            }
        });

        it('400 if roomId not provided', async () => {

            roomId = null;


            try {
                await exec();
            } catch (e) {
                expect(e.status).to.equal(400);
            }
        });

        it('400 if questions array not provided', async () => {
            questions = null;

            try {
                await exec();
            } catch (e) {
                return expect(e.status).to.equal(400);
            }
            throw new Error('Should have thrown error');
        });


        it('400 if questions array empty', async () => {
            questions = [];
            try {
                await exec();
            } catch (e) {
                expect(e.status).to.equal(400);
            }
        });


        it('400 if questions array without id', async () => {
            questions = [{}];

            try {
                await exec();
            } catch (e) {
                expect(e.status).to.equal(400);
            }
        });

        it('400 if questions array without answer', async () => {
            questions = [{_id: question._id}];

            try {
                await exec();
            } catch (e) {
                expect(e.status).to.equal(400);
            }
        });

        it('400 if one question was not from same building as room', async () => {
            const building2 = new Building({name: '1234'});
            await building2.save();

            const room2 = new Room({name: "123", location: "h123", building: building2._id});
            await room2.save();

            const question2 = new Question({name: '12345', room: room2._id});
            await question2.save();

            questions = [{_id: question2._id, answer: 2}];

            try {
                await exec();
            } catch (e) {
                expect(e.status).to.equal(400);
            }
        });

        it('400 if question array length was not the same as room question array length', async () => {

        });

        it('should return 200 if all fields provided correctly', async () => {
            try {
                const res = await exec();
                expect(res.status).to.be.equal(200);
            } catch (e) {
                logger.error(e.response.text);
                throw e;
            }
        });
        // 401 if userId not provided
        // 401 if userId invalid
        // 404 if user with userId not found
        // 400 if roomId not provided
        // 404 if room not found
        // 400 if random parameter
        // 400 if questions array not provided
        // 400 if questions array empty
        // 400 if questions array without _id
        // 400 if questions array without answer
        // 400 if one question was not from
        //   same building as room
        // 400 if question array length was not
        //   same length as room question array
        // should return feedback object with proper userId
        // should populate feedback array in building object
    });

    describe(' GET /roomFeedback/:id', () => {

        let roomId;
        let feedback;
        let building;

        const exec = () => {
            return request(server)
                .get('/api/feedback/roomFeedback/' + roomId)
                .set('userId', user._id);
        };

        beforeEach(async () => {
            building = new Building({name: '324'});
            await building.save();

            const room = new Room({name: '222', location: '123', building: building._id});
            await room.save();

            roomId = room._id;

            const question = new Question({name: '123', answerOptions: ['hej'], room: roomId});

            feedback = new Feedback({
                questions: [{_id: question._id, name: question.name, answer: 'answer'}],
                user: user._id, room: roomId
            });

            await feedback.save();

        });

        it('should return 404 if room not found', async () => {

            roomId = mongoose.Types.ObjectId();

            try {
                await exec();
            } catch (e) {
                expect(e.status).to.be.equal(404);
            }

        });

        it('should return feedback with roomId', async () => {
            const res = await exec();
            const returnedRoomId = res.body[0].room;
            expect(returnedRoomId).to.be.equal(roomId.toString());
        });

        it('should return only feedback objects from given room and not others', async () => {
            const room2 = new Room({name: '222', location: '123', building: building._id});
            await room2.save();

            const question = new Question({name: '123', answerOptions: ['hej'], room: room2._id});

            const feedback2 = new Feedback({
                questions: [{_id: question._id, name: question.name, answer: 'answer'}],
                user: user._id, room: room2.id
            });

            await feedback2.save();

            const res = await exec();
            expect(res.body.length).to.be.equal(1);
        });
    });
});
