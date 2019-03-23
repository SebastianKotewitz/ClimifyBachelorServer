const {Feedback} = require('../../models/feedback');
const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-as-promised'));
const mongoose = require('mongoose');

describe('Feedback in database', () => {

  let feedback;
  beforeEach(() => {
    feedback = new Feedback();
    feedback.question = mongoose.Types.ObjectId();
    feedback.room = mongoose.Types.ObjectId();
    feedback.user = mongoose.Types.ObjectId();
    feedback.answer = mongoose.Types.ObjectId();
  });

  it('should be valid with question, room and user', async () => {
    const res = await feedback.validate();
    expect(res).to.be.undefined;
  });

  it('should have a question id', async () => {
    feedback.question = null;
    await expect(feedback.validate()).to.be.rejectedWith(mongoose.ValidationError);
  });

  it('should have a user id', async () => {
    feedback.room = null;
    await expect(feedback.validate()).to.be.rejectedWith(mongoose.ValidationError);
  });

  it("should have a user", async () => {
    feedback.user = null;
    await expect(feedback.validate()).to.be.rejectedWith(mongoose.ValidationError);
  });
  it("should have an answer", async () => {
    feedback.answer = null;
    await expect(feedback.validate()).to.be.rejectedWith(mongoose.ValidationError);
  });

});
