const {User} = require('../../models/user');
const {Building} = require('../../models/building');
const {Room} = require('../../models/room');
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
        await Building.deleteMany();
        await Room.deleteMany();
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
            user.role = 1;
            await user.save();
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

            expect(newUser.adminOnBuildings.find(elem => elem.toString() === res.body._id)).to.be.ok;
            // assert.strictEqual(newUser.adminOnBuilding.toString(), res.body._id);
        });

        it("should return 403 if user not authorized with login role >= 1", async () => {
            user.role = 0;
            await user.save();
            await expect(exec()).to.be.rejectedWith("Forbidden");
        });

    });

    describe("DELETE /:id", () => {
        let building;
        let buildingId;
        let room;
        let token;

        beforeEach(async () => {
            building = new Building({name: "324"});
            buildingId = building.id;
            user.adminOnBuildings = [buildingId];
            user.role = 1;
            await user.save();
            token = user.generateAuthToken();

            await building.save();
        });

        const exec = () => {
            return request(server)
              .delete("/api/buildings/" + buildingId)
              .set("x-auth-token", token);
        };

        it("Should return empty array of buildings after building was deleted", async () => {
            await exec();
            const buildings = await Building.find();
            expect(buildings.length).to.equal(0);
        });

        it("Should return 403 if user was not admin on the building", async () => {
            user.adminOnBuildings = [];
            await user.save();
            await expect(exec()).to.be.rejectedWith("Forbidden");
        });
    });

    describe("GET /:id", () => {
        let building;
        let buildingId;
        let room;
        let token;
        let roomId;

        beforeEach(async () => {
            building = new Building({name: "324"});
            buildingId = building.id;
            room = new Room({name: "hej", location: "hej", building: buildingId});
            roomId = room.id;
            token = user.generateAuthToken();

            await building.save();
            await room.save();
        });

        const exec = () => {
            return request(server)
              .get("/api/buildings/" + buildingId)
              .set("x-auth-token", token);
        };

        it("Should return only one building", async () => {
            let building = new Building({name: "322"});
            await building.save();
            const res = await exec();
            expect(res.body.name).to.equal("324");
        })

    });

    describe("Get /", () => {

        let building;
        let buildingId;
        let room;
        let token;
        let roomId;

        beforeEach(async () => {
            building = new Building({name: "324"});
            buildingId = building.id;
            room = new Room({name: "hej", location: "hej", building: buildingId});
            roomId = room.id;
            token = user.generateAuthToken();

            await building.save();
            await room.save();
        });

        const exec = () => {
            return request(server)
              .get("/api/buildings")
              .set("x-auth-token", token);
        };

        it("Should return building with room", async () => {
            const res = await exec();
            expect(res.body[0].rooms[0]._id).to.equal(roomId);
        });

        it("Should return array with rooms", async () => {
            let room2 = new Room({name: "hej", location: "hej", building: buildingId});
            let room3 = new Room({name: "hej", location: "hej", building: mongoose.Types.ObjectId()});
            await room2.save();
            await room3.save();
            const res = await exec();
            expect(res.body[0].rooms.length).to.equal(2);
        });

    });
});

