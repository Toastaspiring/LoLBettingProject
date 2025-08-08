const pandascoreService = require('./pandascore.service.js');

describe('PandaScore Service', () => {
    describe('getUpcomingMatches', () => {
        it('should return an array of matches', async () => {
            const matches = await pandascoreService.getUpcomingMatches();
            expect(Array.isArray(matches)).toBe(true);
            expect(matches.length).toBeGreaterThan(0);
        });

        it('should return matches with the correct structure', async () => {
            const matches = await pandascoreService.getUpcomingMatches();
            const match = matches[0];
            expect(match).toHaveProperty('id');
            expect(match).toHaveProperty('name');
            expect(match).toHaveProperty('scheduled_at');
            expect(match).toHaveProperty('status');
            expect(match).toHaveProperty('tournament');
        });
    });

    describe('getMatchDetails', () => {
        it('should return details for a given match ID', async () => {
            const matchId = 12345;
            const details = await pandascoreService.getMatchDetails(matchId);
            expect(details).toBeDefined();
            expect(details.id).toBe(matchId);
        });

        it('should return match details with the correct structure', async () => {
            const matchId = 12345;
            const details = await pandascoreService.getMatchDetails(matchId);
            expect(details).toHaveProperty('id');
            expect(details).toHaveProperty('name');
            expect(details).toHaveProperty('status');
            expect(details).toHaveProperty('team1');
            expect(details).toHaveProperty('team2');
            expect(details.team1).toHaveProperty('id');
            expect(details.team1).toHaveProperty('name');
            expect(details.team1).toHaveProperty('acronym');
            expect(details.team1).toHaveProperty('image_url');
        });
    });
});
