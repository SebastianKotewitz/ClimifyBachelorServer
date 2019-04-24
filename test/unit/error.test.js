const error = require("../../middleware/error");
const sinon = require('sinon');
const assert = require('assert');

let err;
let req;
let res;
let next;

it('Should return 500', async () => {
    err = {};
    res = {};
    req = {params: {
        }};

    res.status = sinon.fake.returns(res);
    res.send = sinon.fake();
    next = sinon.fake();

    error(err, req, res, next);

    assert(res.status.calledWith(500));
    assert(res.send.calledOnce);
    assert(next.called)
});
