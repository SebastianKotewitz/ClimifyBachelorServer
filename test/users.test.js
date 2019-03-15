const {User} = require('../models/user');
const request = require('supertest');
let assert = require('assert');
let server;

describe('/api/users', () => {
    let user;


    beforeEach(async () => {
        server = require('../index');

        user = new User();
        await user.save();
    });

    afterEach(async () => {
        await User.deleteMany();
        await server.close();
    });


    describe('POST /', () => {

        let body;

        const exec = () => {
            return request(server)
                .post('/api/users')
                .send(body);
        };


        // 400 if random parameter in body is passed
        it('400 if random parameter in body is passed', async () => {
            body = {hej: "12345"};

            try {
                await exec();
            } catch (e) {
                assert.strictEqual(e.status, 400);
            }

        });


        it('should return user object with isAdmin=false', async () => {
            body = {};
            const res = await exec();
            assert.strictEqual(res.body.isAdmin, false);
        });

    });
});