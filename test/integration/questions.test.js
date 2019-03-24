
const request = require('supertest');
const {User} = require('../../models/user');
const {Room} = require('../../models/room');
const {Building} = require('../../models/building');
const {Question} = require('../../models/question');
const {Answer} = require('../../models/answer');
const mongoose = require('mongoose');
const assert = require('assert');
const app = require('../..');
const config = require('config');
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = require('chai').expect;

describe('/api/questions', () => {
    let server;
    let user;
    let url;

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
        await Answer.deleteMany();
    });

    describe('GET /', () => {

        let room;
        let building;
        let buildingId;
        let roomId;
        let token;

        const exec = () => {
            return request(server)
                .get('/api/questions')
                .set({'x-auth-token': token, 'roomId': roomId});
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
            token = user.generateAuthToken();

            const question = new Question({
                value: "12345",
                room: roomId,
            });

            await question.save();
        });

        it('Should return 400 if token not provided',async () => {
            token = null;
            await expect(exec()).to.be.rejectedWith("Bad Request");

        });

        it('400 if wrong token format sent', async () => {
            token = "hej";
            await expect(exec()).to.be.rejectedWith("Bad Request");
        });

        it('404 if user was not found', async () => {
            user = new User();
            token = user.generateAuthToken();
            await expect(exec()).to.be.rejectedWith("Not Found");
        });

        it('400 if roomId not provided',  async () => {
            roomId = null;
            await expect(exec()).to.be.rejectedWith("Bad Request");
        });

        it('400 if roomId was wrong format', async () => {
            roomId = '12345';
            await expect(exec()).to.be.rejectedWith("Bad Request");
        });

        it('404 if room was not found', async () => {

            roomId = mongoose.Types.ObjectId();
            await expect(exec()).to.be.rejectedWith("Not Found");

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
                value: "12345",
                room: room2._id
            });

            await question2.save();

            const res = await exec();
            assert.strictEqual(res.body.length, 1);
        });
    });

    describe('POST /', () => {

        url = '/api/questions';
        let building;
        let value;
        let buildingId;
        let roomId;
        let token;
        let answerOptions;

        beforeEach(async () => {
            value = '12345';
            building = new Building({name: value});
            await building.save();
            buildingId = building._id;
            user.adminOnBuilding = building.id;
            const room = new Room({name: '222', location: "123", building: buildingId});
            await room.save();
            roomId = room._id;
            user.role = 1;

            answerOptions = ["Too hot", "Too cold"];

            token = user.generateAuthToken();
            await user.save();
        });

        const exec = () => {
            return request(server)
                .post(url)
                .set('x-auth-token', token)
                .send({roomId, value, answerOptions});
        };

        it('400 if token not provided', async () => {
            token = null;
            await expect(exec()).to.be.rejectedWith("Bad Request");
        });

        it('400 if token not valid', async () => {
            token = '12345';
            await expect(exec()).to.be.rejectedWith("Bad Request");
        });

        it('404 if user was not found', async () => {

            const user2 = new User();
            token = user2.generateAuthToken();
            await expect(exec()).to.be.rejectedWith("Not Found");

        });

        it('400 if roomId not provided', async () => {
            roomId = null;
            await expect(exec()).to.be.rejectedWith("Bad Request");
        });

        it('400 if roomId not valid', async () => {
            roomId = '12345';
            await expect(exec()).to.be.rejectedWith("Bad Request");
        });

        it('404 if roomId not found', async () => {
            roomId = mongoose.Types.ObjectId();
            await expect(exec()).to.be.rejectedWith("Not Found");
        });

        it('400 if value not provided', async () => {
            value = null;
            await expect(exec()).to.be.rejectedWith("Bad Request");
        });

        it("Should return 403 if user not authorized role (1)", async () => {
            user.role = 0;
            await user.save();

            await expect(exec()).to.be.rejectedWith("Forbidden");
        });

        it('403 if user not admin on building', async () => {
            user.adminOnBuilding = null;
            await user.save();
            await expect(exec()).to.be.rejectedWith("Forbidden");
        });

        it("Should return 400 if two or more answer options were not given", async () => {
            answerOptions = null;
            await expect(exec()).to.be.rejectedWith("Bad Request");
        });

        it("Should return 400 if answeroptions did not have minimum 2 elements", async () => {
            answerOptions = ["Too hot"];
            await expect(exec()).to.be.rejectedWith("Bad Request");
        });

        it("Should create answer with value", async () => {
            const res = await exec();
            const answer = await Answer.findOne({value: "Too hot"});
            expect(answer).to.be.ok;
            expect(answer.question.toString()).to.equal(res.body._id);
        });

        it('should return question object with proper room id', async () => {
            const res = await exec();
            assert.strictEqual(res.body.room, roomId.toString());
        });

        it('should only return 1 length array when posted question for two different rooms', async () => {
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
                .set('x-auth-token', user.generateAuthToken())
                .send({roomId: roomId, value: '12345', answerOptions: ["hej", "hej2"]});

            user.adminOnBuilding = building2.id;
            await user.save();

            await request(server)
                .post(url)
                .set('x-auth-token', user.generateAuthToken())
                .send({roomId: room2.id, value: '12345', answerOptions: ["hej", "hej2"]});

            const res = await request(server)
                .get(url)
                .set({roomId: roomId, "x-auth-token": user.generateAuthToken(), answerOptions: ["hej", "hej2"]});

            assert.strictEqual(res.body.length, 1);
        });


    });
});
