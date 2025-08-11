const pandascoreService = require('./pandascore.service.js');

// Store the original API token and fetch function
const originalToken = process.env.PANDASCORE_API_TOKEN;
const originalFetch = global.fetch;

// Mock the global fetch function
global.fetch = jest.fn();

describe('PandaScore Service', () => {
    beforeEach(() => {
        // Reset the mock before each test
        fetch.mockClear();
        // Restore the original token value before each test
        process.env.PANDASCORE_API_TOKEN = originalToken;
    });

    afterAll(() => {
        // Restore the original fetch function and token after all tests
        global.fetch = originalFetch;
        process.env.PANDASCORE_API_TOKEN = originalToken;
    });

    describe('getUpcomingMatches', () => {
        it('should return mock data if API token is not set', async () => {
            process.env.PANDASCORE_API_TOKEN = undefined;
            const matches = await pandascoreService.getUpcomingMatches();
            expect(fetch).not.toHaveBeenCalled();
            expect(Array.isArray(matches)).toBe(true);
            expect(matches[0].id).toBe(12345); // Check for mock data
        });

        it('should fetch and return matches if API token is set', async () => {
            const mockMatches = [{ id: 1, name: 'Real Match' }];
            process.env.PANDASCORE_API_TOKEN = 'test-token';

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockMatches,
            });

            const matches = await pandascoreService.getUpcomingMatches();

            expect(fetch).toHaveBeenCalledWith(
                'https://api.pandascore.co/lol/matches/upcoming',
                expect.any(Object)
            );
            expect(matches).toEqual(mockMatches);
        });

        it('should handle API errors gracefully', async () => {
            process.env.PANDASCORE_API_TOKEN = 'test-token';

            fetch.mockResolvedValueOnce({
                ok: false,
                statusText: 'Internal Server Error',
            });

            const matches = await pandascoreService.getUpcomingMatches();
            expect(matches).toEqual([]);
        });
    });

    // Tests for getMatchDetails remain unchanged as the function is still a mock
    describe('getMatchDetails', () => {
        it('should return details for a given match ID', async () => {
            const matchId = 12345;
            const details = await pandascoreService.getMatchDetails(matchId);
            expect(details).toBeDefined();
            expect(details.id).toBe(matchId);
        });
    });
});
