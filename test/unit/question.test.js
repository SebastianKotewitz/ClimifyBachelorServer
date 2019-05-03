const {Question, validate} = require('../../models/question');
const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-as-promised'));
const mongoose = require('mongoose');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);


describe('Question Validation', () => {

    describe("Question in database", () => {
        let question;
        beforeEach(() => {
            question = new Question();
            question.room = mongoose.Types.ObjectId();
            question.value = "how is the weather?";
            question.answerOptions = [
                {
                    _id: mongoose.Types.ObjectId(),
                    value: "Fine"
                }, {
                    _id: mongoose.Types.ObjectId(),
                    value: "Too cold"
                }];
        });

        it("should have a room", async () => {
            question.room = null;
            await expect(question.validate()).to.be.rejectedWith(mongoose.ValidationError);
        });
        it('should have a value', async () => {
            question.value = null;
            await expect(question.validate()).to.be.rejectedWith(mongoose.ValidationError);
        });

        it("Should have a list of answer options", async () => {
            question.answerOptions = null;
            await expect(question.validate()).to.be.rejectedWith(mongoose.ValidationError);
        });

        it("Should have object id in answer options", async () => {
            question.answerOptions = ["hej"];
            await expect(question.validate()).to.be.rejectedWith(mongoose.ValidationError);
        });

        it("Should have object id in answer options", async () => {
            question.answerOptions = [mongoose.Types.ObjectId()];
            await expect(question.validate()).to.be.rejectedWith(mongoose.ValidationError);
        });

        it("Should have boolean isActive", async () => {
            question.isActive = null;
            await expect(question.validate()).to.be.rejectedWith(mongoose.ValidationError);
        });

        it("Should validate successfully if all parameters parsed", async () => {
            const res = await question.validate();
            expect(res).to.not.be.ok;
        });

    });

    describe("Question from client", () => {

        let answerOptions;
        let roomId;
        let value;

        const exec = () => {
            return validate({answerOptions, roomId, value});
        };

        beforeEach(() => {
            answerOptions = ["cold", "too hot", "nice"];
            roomId = mongoose.Types.ObjectId().toString();
            value = "How is the weather?";
        });

        it("Should be validated successfully if all parameters parsed", () => {
            const {error} = exec();
            expect(error).to.not.be.ok;
        });

        it("Should return error if value not provided", () => {
            value = null;
            const {error} = exec();
            expect(error.name).to.equal('ValidationError');
        });
    });
});
