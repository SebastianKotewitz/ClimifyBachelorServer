const {Room, validate} = require('../../models/room');
const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-as-promised'));
const mongoose = require('mongoose');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);


describe('Room validation', () => {

    describe("Room in DB", () => {
        let room;
        beforeEach(() => {
            room = new Room();
            room.building = mongoose.Types.ObjectId();
            room.name = "perfect!";
            room.location = "324";
        });

        it('should be valid with building, location and name', async () => {
            const res = await room.validate();
            expect(res).to.be.undefined;
        });

        it('should have a building id', async () => {
            room.building = null;
            await expect(room.validate()).to.be.rejectedWith(mongoose.ValidationError);
        });

        it('should have a name', async () => {
            room.name = null;
            await expect(room.validate()).to.be.rejectedWith(mongoose.ValidationError);
        });
        it('should have a location', async () => {
            room.location = null;
            await expect(room.validate()).to.be.rejectedWith(mongoose.ValidationError);
        });

    });

    describe("Room from client", () => {
        let buildingId;
        let name;

        beforeEach(() => {
            buildingId = mongoose.Types.ObjectId().toHexString();
            name = "222";
        });
        const exec = () => {
            return validate({buildingId, name});
        };

        it("should have a buildingId", () => {
            buildingId = null;

            const {error} = exec();
            expect(error.name).to.equal('ValidationError');
        });

        it("should be validated successfully if buildingId and name provided", async () => {
            const {error} = exec();
            expect(error).to.not.be.ok;
        });

        it("should have name", async () => {
            name = null;
            const {error} = exec();
            expect(error.name).to.equal("ValidationError");
        });
    });
});
