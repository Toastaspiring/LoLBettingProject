const request = require('supertest');
const { app, server } = require('./index.js');
const betsService = require('./bets.service.js');
const authService = require('./auth.service.js');

// Mock services
jest.mock('./bets.service.js');
jest.mock('./auth.service.js');

// This is a Jest hook that runs after all tests in this file have completed.
// We use it to close the server, which prevents Jest from hanging.
afterAll((done) => {
    server.close(done);
});

describe('API Endpoints', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

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

    describe('Betting Endpoints', () => {
        describe('POST /bets', () => {
            it('should create a bet and return 201 on success', async () => {
                const betData = { userId: 1, matchId: 10, teamId: 101, amount: 50 };
                const createdBet = { id: 1, ...betData, status: 'placed' };

                betsService.createBet.mockResolvedValue(createdBet);

                const res = await request(app)
                    .post('/bets')
                    .send(betData);

                expect(res.statusCode).toEqual(201);
                expect(res.body).toEqual(createdBet);
                expect(betsService.createBet).toHaveBeenCalledWith(betData);
            });

            it('should return 400 if required fields are missing', async () => {
                const betData = { userId: 1, matchId: 10 }; // Missing teamId and amount

                const res = await request(app)
                    .post('/bets')
                    .send(betData);

                expect(res.statusCode).toEqual(400);
                expect(res.body.message).toBe('Missing required fields for bet.');
                expect(betsService.createBet).not.toHaveBeenCalled();
            });
        });

        describe('GET /users/:userId/bets', () => {
            it('should return all bets for a user', async () => {
                const userId = 1;
                const userBets = [
                    { id: 1, userId, matchId: 10, teamId: 101, amount: 50, status: 'placed' },
                    { id: 2, userId, matchId: 11, teamId: 103, amount: 100, status: 'won' }
                ];

                betsService.getBetsForUser.mockResolvedValue(userBets);

                const res = await request(app).get(`/users/${userId}/bets`);

                expect(res.statusCode).toEqual(200);
                expect(res.body).toEqual(userBets);
                expect(betsService.getBetsForUser).toHaveBeenCalledWith(String(userId));
            });
        });
    });

    describe('Auth Endpoints', () => {
        const agent = request.agent(app); // Use an agent to persist cookies

        it('GET /auth/me should return 401 when not logged in', async () => {
            const res = await agent.get('/auth/me');
            expect(res.statusCode).toEqual(401);
        });

        it('GET /auth/riot should redirect to the callback', async () => {
            const res = await agent.get('/auth/riot');
            expect(res.statusCode).toEqual(302); // 302 is the status code for redirect
            expect(res.headers.location).toContain('/auth/riot/callback');
        });

        it('should log in a user, set a session, and allow access to /me', async () => {
            const mockUser = { id: 1, username: 'MockUser', riot_id: 'mock-riot-id-123' };
            authService.findOrCreateUser.mockResolvedValue(mockUser);

            // 1. Hit the login route, which will redirect and log us in
            const loginRes = await agent.get('/auth/riot');

            // The agent will follow the redirect and store the cookie automatically.
            expect(loginRes.statusCode).toEqual(200);
            expect(loginRes.body.message).toBe('Login successful!');

            // 2. Now that we are "logged in", we should be able to access /auth/me
            const meRes = await agent.get('/auth/me');
            expect(meRes.statusCode).toEqual(200);
            expect(meRes.body).toEqual({
                id: mockUser.id,
                username: mockUser.username,
                riotId: mockUser.riot_id,
            });

            // 3. Log out
            const logoutRes = await agent.post('/auth/logout');
            expect(logoutRes.statusCode).toEqual(200);

            // 4. Verify we are logged out
            const finalMeRes = await agent.get('/auth/me');
            expect(finalMeRes.statusCode).toEqual(401);
        });
    });
});
