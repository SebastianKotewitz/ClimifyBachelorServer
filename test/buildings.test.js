const {User} = require('../models/user');
const request = require('supertest');
const assert = require('assert');

describe('/api/buildings', () => {
    let server;
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

        let building;
        let buildingName;

        const exec = () => {
            console.log(user);
            return request(server)
                .post('/api/buildings')
                .set('userId', user._id)
                .send(building);
        };

        beforeEach(async () => {
            buildingName = '324';

            building = {name: buildingName};
        });

        it('401 if userId not provided in header', async () => {
            user._id = null;
            try {
                await exec();
            } catch (e) {
                assert.strictEqual(e.status, 401);
            }
        });

        it('400 if name not provided', async () => {
            buildingName = null;
            try {
                await exec();
            } catch (e) {
                assert.strictEqual(e.status, 400);
            }
        });

        it('should have user as admin on newly posted building', async () => {
            assert.strictEqual(user.adminOnBuilding, undefined);
            await exec();
            const newUser = User.findById(user._id);
            assert.strictEqual(newUser.adminOnBuilding, building._id);
        });

    });
});