let server;
const request = require('supertest');


describe('/api/feedback', () => {
    beforeEach(() => {
        server = require('../../index');
    });

    afterEach(() => {
        server.close();
    });

    describe('POST /', () => {
        it('Should return 400 when no userId provided', async () => {
            const res = await request(server).post('/api/feedback');
            expect(res.status).toBe(401);

        });
    });
});




// Feedback use case:

// 401 no id provided
// 404 user not found
// 400 roomId not provided
// 400 questions array not provided
// 400 # questions does not match db
// 400 answer not provided
// 404 room does not exist
// 404 one question does not exist
// 400 answer was not integer between 0 and 10
// 400 question answered multiple times
// 200 valid request
// return new feedback object