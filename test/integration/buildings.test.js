const {User} = require('../../models/user');
const {Building} = require('../../models/building');
const request = require('supertest');
const assert = require('assert');
const mongoose = require('mongoose');
const app = require('../..');
const config = require('config');
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = require("chai").expect;
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
        let token;

        const exec = () => {
            return request(server)
                .post('/api/buildings')
                .set('x-auth-token', token)
                .send({name: buildingName});
        };


        beforeEach(async () => {
            buildingName = '324';
            token = user.generateAuthToken();
        });

        afterEach(async () => {
            await server.close();
        });


        it('400 if json token not provided in header', async () => {
            token = null;
            await expect(exec()).to.be.rejectedWith("Bad Request");
        });

        it('400 if name not provided', async () => {
            buildingName = null;
            await expect(exec()).to.be.rejectedWith("Bad Request");
        });

        it('should have user as admin on newly posted building', async () => {
            assert.strictEqual(user.adminOnBuilding, undefined);
            const res = await exec();
            const newUser = await User.findById(user._id);
            assert.strictEqual(newUser.adminOnBuilding.toString(), res.body._id);
        });

    });
});

