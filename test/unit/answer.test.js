const {Answer, validate} = require('../../models/answer');
const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-as-promised'));
const mongoose = require('mongoose');

describe("Answers", () => {
    describe('Answer in database', () => {

        let answer;
        beforeEach(() => {
            answer = new Answer();
            answer.value = "perfect!";
        });

        it('should be valid with question', async () => {
            const res = await answer.validate();
            expect(res).to.be.undefined;
        });

        /*
            it('should have a question id', async () => {
                answer.question = null;
                await expect(answer.validate()).to.be.rejectedWith(mongoose.ValidationError);
            });
        */

        it('should have a value', async () => {
            answer.value = null;
            await expect(answer.validate()).to.be.rejectedWith(mongoose.ValidationError);
        });
    });
    describe("Answer from client", () => {
        it("Should not allow random parameters", () => {

            const {error} = validate({
                value: "1234",
                random: "123"
            });

            expect(error.name).to.equal("ValidationError");
        });

        it("Should validate successfully when all parameters parse", () => {
            const {error} = validate({
                value: "1234"
            });

            expect(error).to.not.be.ok;
        });
    });

});

