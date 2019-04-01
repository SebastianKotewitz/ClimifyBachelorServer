const {Question} = require('../../models/question');
const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-as-promised'));
const mongoose = require('mongoose');

describe('Question in database', () => {

    let question;
    beforeEach(() => {
        question = new Question();
        question.room = mongoose.Types.ObjectId();
        question.value = "how is the weather?"
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
        question.answerOptions = []
    });

});
