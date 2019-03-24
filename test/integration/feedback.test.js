const {User} = require('../../models/user');
const {Building} = require('../../models/building');
const {Question} = require('../../models/question');
const {Feedback} = require('../../models/feedback');
const {Room} = require('../../models/room');
const {Answer} = require('../../models/answer');
const logger = require('../../startup/logger');
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../..');
const config = require('config');
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = require('chai').expect;
const jwt = require("jsonwebtoken");

describe('/api/feedback', () => {
    let server;
    let user;
    let room;
    let question;
    let building;
    let token;
    let roomId;
    let answer;
    let questionId;
    let answerId;

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
                .set({'x-auth-token': token})
                .send({roomId, questionId, answerId})
        };

        beforeEach(async () => {
            building = new Building({name: '324'});
            await building.save();

            token = user.generateAuthToken();

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
            answerId = answer._id;
            await answer.save();

        });

        it('should return 401 if token not provided', async () => {
            token = "";
            await expect(exec()).to.be.rejectedWith("Unauthorized");
        });

        it('should return 400 if invalid token', async () => {
            token = '123';
            await expect(exec()).to.be.rejectedWith("Bad Request");
        });


        it('400 if invalid token', async () => {
            token = jwt.sign({hej: "hej"}, "hej");
            await expect(exec()).to.be.rejectedWith("Bad Request");

        });

        it('400 if roomId not provided', async () => {
            roomId = null;
            await expect(exec()).to.be.rejectedWith("Bad Request");
        });

        it('400 if question not provided', async () => {
            questionId = null;
            await expect(exec()).to.be.rejectedWith("Bad Request");
        });

        it('400 if questionId not set', async () => {
            questionId = null;
            await expect(exec()).to.be.rejectedWith("Bad Request");
        });


        it('400 if one question was not from same building as room', async () => {
            const building2 = new Building({name: '1234'});
            await building2.save();

            const room2 = new Room({name: "123", location: "h123", building: building2._id});
            await room2.save();

            const question2 = new Question({value: '12345', room: room2._id});
            await question2.save();

            questionId = question2.id;

            await expect(exec()).to.be.rejectedWith("Bad Request");
        });

        it('400 if question array length was not the same as room question array length', async () => {

        });

        it("Should return 400 if question was from other room than feedback", async () => {
            question.room = mongoose.Types.ObjectId();
            await question.save();
            await expect(exec()).to.be.rejectedWith("Bad Request");
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
    });

    describe(' GET /roomFeedback/:id', () => {

        let roomId;
        let feedback;
        let building;

        const exec = () => {
            return request(server)
                .get('/api/feedback/roomFeedback/' + roomId)
                .set('token', user._id);
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
            await expect(exec()).to.be.rejectedWith("Not Found");
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
