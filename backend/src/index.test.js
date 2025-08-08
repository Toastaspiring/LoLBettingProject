const request = require('supertest');
const { app, server } = require('./index.js');

// This is a Jest hook that runs after all tests in this file have completed.
// We use it to close the server, which prevents Jest from hanging.
afterAll((done) => {
    server.close(done);
});

describe('API Endpoints', () => {
    describe('GET /', () => {
        it('should return a 200 status code and a welcome message', async () => {
            const res = await request(app).get('/');
            expect(res.statusCode).toEqual(200);
            expect(res.text).toBe('Welcome to the LoL Esports Betting Platform API!');
        });
    });

    describe('GET /matches/upcoming', () => {
        it('should return a 200 status code and an array of matches', async () => {
            const res = await request(app).get('/matches/upcoming');
            expect(res.statusCode).toEqual(200);
            expect(res.headers['content-type']).toMatch(/json/);
            expect(Array.isArray(res.body)).toBe(true);
        });

        it('should return matches with the correct structure', async () => {
            const res = await request(app).get('/matches/upcoming');
            expect(res.body.length).toBeGreaterThan(0);
            expect(res.body[0]).toHaveProperty('id');
            expect(res.body[0]).toHaveProperty('name');
        });
    });

    describe('GET /matches/:id', () => {
        it('should return a 200 status code and details for a specific match', async () => {
            const matchId = 12345;
            const res = await request(app).get(`/matches/${matchId}`);
            expect(res.statusCode).toEqual(200);
            expect(res.headers['content-type']).toMatch(/json/);
            expect(res.body).toHaveProperty('id', matchId);
        });

        it('should return match details with the correct team structure', async () => {
            const matchId = 12345;
            const res = await request(app).get(`/matches/${matchId}`);
            expect(res.body).toHaveProperty('team1');
            expect(res.body).toHaveProperty('team2');
            expect(res.body.team1).toHaveProperty('name');
        });
    });
});
