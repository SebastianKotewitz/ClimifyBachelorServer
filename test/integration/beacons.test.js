const {User} = require('../../models/user');
const {Building} = require('../../models/building');
const request = require('supertest');
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = require("chai").expect;
const app = require('../..');
let server;
const config = require('config');
const mongoose = require('mongoose');

describe('/api/beacons', () => {
    let user;
    let building;
    let token;

    before(async () => {
        server = app.listen(config.get('port'));
        await mongoose.connect(config.get('db'), {useNewUrlParser: true});
    });
    after(async () => {
        await server.close();
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        user = new User({role: 1});
        /*room = new Room({
            name: "222",
            building: mongoose.Types.ObjectId(),
            activeQuestions: [mongoose.Types.ObjectId()],
            location: "222"
        });*/
        building = new Building({
            name: "222",
        });
        await building.save();
        await user.save();
    });
    afterEach(async () => {
        await User.deleteMany();
        await Building.deleteMany();
    });


    describe('POST /', () => {
        let buildingId;
        let name;
        let uuid;
        let randomParam;


        const exec = () => {
            return request(server)
              .post('/api/beacons')
              .set("x-auth-token", token)
              .send({uuid, buildingId, name, randomParam});
        };

        beforeEach(async () => {
            token = user.generateAuthToken();
            uuid = "vsk1vs12-vsk1-sk12-vk12-vk12vk12vk12";
            buildingId = building.id;
            name = "beacon1";
            randomParam = undefined;
        });

        // 400 if random parameter in body is passed
        it('400 if random parameter in body is parsed', async () => {
            randomParam = "hej";
            await expect(exec()).to.be.rejectedWith("Bad Request");

        });

        it("Should accept uuid value", async () => {
            uuid = "f7826da6-4fa2-4e98-8024-bc5b71e0891e";
            const res = await exec();
            expect(res.body).to.be.ok;
        });

        it("should return 403 if user with unauthorized role (0) tries to post beacon", async () => {
            user.role = 0;
            await user.save();
            token = user.generateAuthToken();
            await expect(exec()).to.be.rejectedWith("Forbidden");
        });

        it("Should post new beacon with right parameters", async () => {
            const res = await exec();
            expect(res.status).to.equal(200);
        });
    });
});
