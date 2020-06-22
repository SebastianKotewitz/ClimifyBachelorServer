const expect = require('chai').expect;

module.exports = (res, errorCode) => {
    try {
        return expect(res.status).to.be.equal(errorCode);
    } catch (_) {
        switch (errorCode) {
            case 400:
                expect.fail("Should have returned: Bad Request (400)");
                break;

            case 401:
                expect.fail("Should have returned: Unauthorized (401)");
                break;

            case 403:
                expect.fail("Should have returned: Forbidden (403)");
                break;

            case 404:
                expect.fail("Should have returned: Not Found (404)");
                break;
                
            default:
                expect.fail("Should have returned " + errorCode);
                break;
        }
    }
}