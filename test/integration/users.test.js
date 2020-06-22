const { User } = require('../../models/user');
const request = require('supertest');
let assert = require('assert');
const app = require('../..');
let server;
const config = require('config');
const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = chai.expect;
chai.should();
const expectErrorCode = require('../expectErrorCode');

describe('/api/users', () => {
    let user;
    let token;

    before(async () => {
        server = app.listen(config.get('port'));
        await mongoose.connect(config.get('db'), { useNewUrlParser: true });
    });
    after(async () => {
        await server.close();
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        user = new User();
        token = user.generateAuthToken();
        await user.save();
    });
    afterEach(async () => {
        await User.deleteMany();
    });

    describe("GET /", () => {
        let query;
        const exec = () => {
            return request(server)
                .get("/api/users" + query)
                .set('x-auth-token', token);
        };

        beforeEach(async () => {
            user = new User({
                email: "hej",
                password: "yo",
                role: 2
            });
            token = user.generateAuthToken();
            await user.save();
            query = "";
        });

        it("Should not return password", async () => {

            const res = await exec();
            const users = res.body;
            const password = users.find((elem) => elem._id === user.id).password;
            expect(password).to.not.be.ok;
        });

        it("Should return 403 if user was not admin", async () => {
            user.role = 1;
            await user.save();
            const res = await exec();
            expectErrorCode(res, 403);
        });

        it("Should return 401 if token not provided", async () => {
            token = null;
            const res = await exec();
            expectErrorCode(res, 401);
        });

    });

    describe("GET / getUserIdFromEmail / :email", () => {
        let emailQuery;
        let otherUser;

        const exec = () => {
            return request(server)
                .get("/api/users/getUserIdFromEmail/" + emailQuery)
                .set('x-auth-token', token);
        };

        beforeEach(async () => {
            user = new User({
                email: "hej@hej.com",
                password: "yo",
                role: 1,
            });
            otherUser = new User({
                email: "test@test.com",
                password: "whatever",
                role: 1,
            });
            await user.save();
            await otherUser.save();
            token = user.generateAuthToken();
            emailQuery = otherUser.email;
        });

        it("Should return 403 if user was not a registered user", async () => {
            user.role = 0;
            await user.save();
            token = user.generateAuthToken();
            const res = await exec();
            expectErrorCode(res, 403);
        });

        it("Should return 401 if token not provided", async () => {
            token = null;
            const res = await exec();
            expectErrorCode(res, 401);
        });

        it("Should return 404 if no user with the email was found", async () => {
            emailQuery = "notfound@email.com";
            const res = await exec();
            expectErrorCode(res, 404);
        });

        it("Should find the user id if a user with the email was found", async () => {
            const res = await exec();
            expect(res.text).to.be.equal(otherUser.id, "Correct id of searched user not found");
        });

    });

    describe('POST /', () => {

        describe("Unauthorized user", () => {
            let body;
            beforeEach(() => {
                body = {};
            });

            const exec = () => {
                return request(server)
                    .post("/api/users")
                    .send(body);
            };

            // 400 if random parameter in body is passed
            it('400 if  random parameter in body is passed', async () => {
                body = { hej: "12345" };
                const res = await exec();
                expectErrorCode(res, 400);
            });

            it("Should have user role 0 when no email+password provided", async () => {
                const res = await exec();
                const decoded = jwt.decode(res.header["x-auth-token"]);
                const user = await User.findById(decoded._id);
                assert.strictEqual(user.role, 0);
            });

            it("Should be a valid mongoose id decoded by returned json web token", async () => {
                const res = await exec();
                const decoded = jwt.decode(res.header["x-auth-token"]);
                assert.strictEqual(mongoose.Types.ObjectId.isValid(decoded._id), true);
            });
        });

        describe("Authorized user", () => {
            let email;
            let password;

            const exec = () => {
                return request(server)
                    .post('/api/users')
                    .send({ email, password });
            };

            beforeEach(async () => {
                email = "user1@gmail.com";
                password = "qweQWE123";
            });

            afterEach(async () => {
                await User.deleteMany();
            });


            it("Should create user with authorized role if valid email and password provided", async () => {
                try {
                    await exec();
                } catch (e) {
                    console.log(e);
                }

                const user = await User.findOne({ email });

                assert.strictEqual(user.role, 1);
            });

            it("should return 400 if email invalid", async () => {
                email = "user@";
                const res = await exec();
                expectErrorCode(res, 400);
            });

            it("Should not allow (400) two users to be created with the same email", async () => {
                await exec();
                const res = await exec();
                expectErrorCode(res, 400);
            });

            it("Should return json web token in header that can be decoded to valid mongoose _id", async () => {
                const res = await exec();
                const decodedToken = jwt.decode(res.headers["x-auth-token"]);
                expect(mongoose.Types.ObjectId.isValid(decodedToken._id)).to.be.true;
            });

        });
    });

    describe("PATCH /makeBuildingAdmin", () => {
        let newUser;
        let newUserId;
        let buildingId;

        beforeEach(async () => {
            buildingId = mongoose.Types.ObjectId();
            user = await new User({
                email: "hej",
                password: "yo",
                adminOnBuildings: [buildingId],
                role: 1
            }).save();


            newUser = await new User({
                email: "hej",
                password: "yo",
                adminOnBuildings: [],
                role: 1
            }).save();
            newUserId = newUser.id;

            token = user.generateAuthToken();
        });

        const exec = () => {
            return request(server)
                .patch("/api/users/makeBuildingAdmin")
                .set('x-auth-token', token)
                .send({
                    userId: newUserId,
                    buildingId: buildingId
                });
        };

        it("Should return 403 if user was not admin on building", async () => {
            user.adminOnBuildings = [];
            await user.save();

            const res = await exec();
            expectErrorCode(res, 403);
        });

        it("Should return 401 if no token provided", async () => {
            token = null;
            const res = await exec();
            expectErrorCode(res, 401);
        });

        it("Should return updated user with adminOnBuildings updated", async () => {
            const res = await exec();
            expect(res.body.adminOnBuildings[0]).to.equal(user.adminOnBuildings[0].toString());
        });

    });
});
