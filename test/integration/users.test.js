const {User} = require('../../models/user');
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

describe('/api/users', () => {
    let user;

    before(async () => {
        server = app.listen( config.get('port'));
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
    });

    describe("GET /", () => {

        const exec = () => {
            return request(server)
              .get("/api/users");
        };

        it("Should not return password", async () => {
            const user = new User({email: "hej", password: "yo"});
            await user.save();
            const res = await exec();
            const users = res.body;
            const password = users.find((elem) => elem._id === user.id).password;
            console.log(password);
            expect(password).to.not.be.ok;
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
                body = {hej: "12345"};
                await expect(exec()).to.be.rejectedWith("Bad Request");
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
                  .send({email, password});
            };

            beforeEach(async () => {
                email = "user1@gmail.com";
                password = "Asdf1234";
            });

            afterEach(async () => {
                await User.deleteMany();
            });


            it("Should create user with authorized role if valid email and password provided", async () => {
                await exec();
                const user = await User.findOne({email});

                assert.strictEqual(user.role, 1);
            });

            it("should return 400 if email invalid", async () => {
                email = "user@";
                await expect(exec()).to.be.rejectedWith("Bad Request");
            });

            it("Should not allow two users to be created with the same email", async () => {
                await exec();
                await expect(exec()).to.be.rejectedWith("Bad Request");
            });

            it("Should return json web token in header that can be decoded to valid mongoose _id", async () => {
                const res = await exec();
                const decodedToken = jwt.decode(res.headers["x-auth-token"]);
                expect(mongoose.Types.ObjectId.isValid(decodedToken._id)).to.be.true;
            });

        });
    });
});
