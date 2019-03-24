const {User} = require('../../models/user');
const request = require('supertest');
const assert = require('assert');
const mongoose = require('mongoose');
const app = require('../..');
const config = require('config');
let server;

describe('/api/buildings', () => {
    let user;

    before(async () => {
        server = app.listen(config.get('port'));
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
    afterEach( async () => {
        await User.deleteMany();
    });

    describe('POST /', () => {

        let building;
        let buildingName;

        const exec = () => {
            return request(server)
                .post('/api/buildings')
                .set('x-auth-token', user.generateAuthToken())
                .send(building);
        };


        beforeEach(async () => {
            buildingName = '324';

            building = {name: buildingName};
        });

        afterEach(async () => {
            await server.close();
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

