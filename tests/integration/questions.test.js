let server;
const request = require('supertest');
const {User} = require('../../models/user');
const {Room} = require('../../models/room');
const {Building} = require('../../models/building');
const {Question} = require('../../models/question');
const mongoose = require('mongoose');

let user;

describe('/api/questions', () => {
    beforeEach(() => {
        server = require('../../index');
        user = new User();
    });

    afterEach(async () => {
        await server.close();
        await User.deleteMany();
        await Question.deleteMany();
        await Building.deleteMany();
        await Room.deleteMany();
    });

    describe('GET /', () => {

        // should return 401 if userId not set in header
        // 400 if wrong type of userId sent
        // 404 if user was not found
        // should return 400 if roomId not set in header
        // 404 if room not found
        // Return array of questions
        const url = '/api/questions';


        it('Should return 401 if userId not provided',  (done) => {
            request(server)
                .get(url)
                .expect(401, done)
        });

        it('400 if wrong userId format sent', (done) => {
            request(server)
                .get(url)
                .set('userId', '1234')
                .expect(400, done);
        });

        it('404 if user was not found', (done) => {
            request(server)
                .get(url)
                .set('userId', user._id)
                .expect(404, done);

        });

        it('400 if roomId not provided',  async (done) => {

            await user.save();

            request(server)
                .get('/api/questions')
                .set('userId', user._id)
                .expect(400, done);
        });

        it('400 if roomId was wrong format', async (done) => {
            await user.save();

            request(server)
                .get(url)
                .set({'userId': user._id, 'roomId': '12345'})
                .expect(400, done);

        });

        it('404 if room was not found', async (done) => {
            await user.save();

            request(server)
                .get(url)
                .set({'userId': user._id, 'roomId': mongoose.Types.ObjectId()})
                .expect(404, done);
        });

        it('should return question object with roomId field', async (done) => {
            await user.save();
            const building = new Building({name: '12345'});
            await building.save();
            const room = new Room({
                building: building._id,
                name: "12345",
                location: "12345"
            });

            await room.save();

            const question = new Question({
                name: "12345",
                building: building._id
            });

            await question.save();

            const res = await request(server)
                .get(url)
                .set({'userId': user._id, 'roomId': room._id});

            console.log(res.body);

            expect(res.body[0].building).toBe(building._id);
        });
    });
});