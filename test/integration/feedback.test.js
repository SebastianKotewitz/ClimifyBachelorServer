const {User} = require('../../models/user');
const {Building} = require('../../models/building');
const {Question} = require('../../models/question');
const {Feedback} = require('../../models/feedback');
const {Room} = require('../../models/room');
const {Answer} = require('../../models/answer');
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
    let answer;
    let questionId;

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
                .send({roomId, questionId, answerId: answer._id})
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

            question = new Question({value: '123', room: room._id});
            await question.save();
            questionId = question._id;

            answer = new Answer({value: "perfect", question: question._id});
            await answer.save();

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

        it('400 if question not provided', async () => {
            questionId = null;

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

            const question2 = new Question({value: '12345', room: room2._id});
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

            const question = new Question({value: '123',  room: roomId});
            const answer = new Answer({value: "123", question: question._id});

            feedback = new Feedback({
                answer: answer._id,
                question: question._id,
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

            const question = new Question({value: '123', room: room2._id});
            const answer = new Answer({value: "hey", question: question._id});

            const feedback2 = new Feedback({
                question: question._id,
                answer: answer.id,
                room: room2._id,
                user: user._id
            });

            await feedback2.save();

            const res = await exec();
            expect(res.body.length).to.be.equal(1);
        });
    });
});
