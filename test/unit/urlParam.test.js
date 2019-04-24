const validate = require('../../middleware/validateIdParam');
const sinon = require('sinon');
const assert = require('assert');


describe('Validation of url id parameter', () => {
    let req;
    let res;

    it('should return 400 if id not provided', async () => {
        res = {};
        req = {params: {

            }};

        res.status = sinon.fake.returns(res);
        res.send = sinon.fake();

        validate(req, res, {});
        console.log(res.send);

        assert(res.status.calledWith(400));
        assert(res.send.calledOnce);
        assert(res.send.calledWith('Hej'));

    });

    it('should return 400 if invalid id', () => {
        res = {};
        req = {params: {
                id: 'undefined'
            }};

        res.status = sinon.fake.returns(res);
        res.send = sinon.fake();

        validate(req, res, {});

        assert(res.status.calledWith(400));
        assert(res.send.calledWith('Id did not have the proper format (mongoose Object Id)'));
    });

});
