const {User} = require('../models/user');
const {Building} = require('../models/building');
const {Question} = require('../models/question');
const {Room} = require('../models/room');
const expect = require('chai').expect;
const request = require('supertest');
const mongoose = require('mongoose');
const assert = require('assert');

describe('/api/feedback', () => {
    let server;
    let user;
    let room;
    let questions;
    let question;
    let building;
    let userId;
    let roomId;

    beforeEach(async () => {
        server = require('../index');
        user = new User();
        await user.save();
    });

    afterEach(async () => {
        await User.deleteMany();
        await Building.deleteMany();
        await Room.deleteMany();
        await Question.deleteMany();
        await server.close();
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

            room = new Room({name: '123',
                location: '123',
                building: building._id});
            await room.save();

            roomId = room._id;

            question = new Question({name: '123', building: building._id});
            // questions = [question];
            await question.save();

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
            exec().catch((e) => {
                expect(e.status).to.equal(400);
            });
        });


        it('400 if questions array empty', async () => {
            questions = [];
            exec().catch((e) => {
                expect(e.status).to.equal(400);
            });
        });


        it('400 if questions array without id', () => {
            questions = [{}];
            exec().catch((e) => {
                expect(e.status).to.equal(400);
            });
        });

        it('400 if questions array without answer',  () => {
            questions = [{_id: question._id}];
            exec().catch((e) => {
                expect(e.status).to.equal(400);
            });
        });

        it('400 if one question was not from same building as room', async () => {
            const building2 = new Building({name: '1234'});
            await building2.save();

            const question2 = new Question({name: '12345', building: building2._id});
            await question2.save();

            questions = [{_id: question2._id, answer: 2}];
            exec().catch(e => {
                expect(e.status).to.equal(400);
            })
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
        //   same length as building question array
        // should return feedback object with proper userId
        // should populate feedback array in building object


    });

});
