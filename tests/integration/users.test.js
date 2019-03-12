let server;
const request = require('supertest');


describe('/api/users', () => {
    beforeEach(() => {
        server = require('../../index');
        //logger.info('hej');
    });

    afterEach(() => {
        server.close();
    });

    describe('POST /', () => {

        /*it('should return 400 if wrong parameters were provided', async () => {
            request(server).post('/api/users')
                .send({name2: "hej"}).then(res => {
                expect(res.status).toBe(400);
                }).catch(err => {

                expect(err).toBe("hej");
                });


        })*/

    });
});