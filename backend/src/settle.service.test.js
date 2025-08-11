const pandascoreService = require('./pandascore.service.js');
const betsService = require('./bets.service.js');
const { settleAllBets } = require('./settle.service.js');

// Mock the services that settleAllBets depends on
jest.mock('./pandascore.service.js');
jest.mock('./bets.service.js');

describe('Settle Service', () => {
    beforeEach(() => {
        // Clear all mocks before each test to ensure a clean slate
        jest.clearAllMocks();
    });

    it('should fetch past matches and settle bets correctly for winners and losers', async () => {
        const mockMatches = [
            { id: 101, name: 'G2 vs T1', winner_id: 1 },
            { id: 102, name: 'FNC vs JDG', winner_id: 4 }
        ];
        const mockBetsForMatch1 = [
            { id: 1, user_id: 1, match_id: 101, team_id: 1, amount: 100 }, // Winning bet
            { id: 2, user_id: 2, match_id: 101, team_id: 2, amount: 50 },  // Losing bet
        ];
        const mockBetsForMatch2 = [
            { id: 3, user_id: 3, match_id: 102, team_id: 4, amount: 200 }, // Winning bet
        ];

        // Setup mock return values
        pandascoreService.getPastMatches.mockResolvedValue(mockMatches);
        betsService.getPlacedBetsByMatchId
            .mockResolvedValueOnce(mockBetsForMatch1) // for match 101
            .mockResolvedValueOnce(mockBetsForMatch2); // for match 102
        betsService.settleBetTransaction.mockResolvedValue(); // Assume success

        await settleAllBets();

        // Verify that the services were called correctly
        expect(pandascoreService.getPastMatches).toHaveBeenCalledTimes(1);
        expect(betsService.getPlacedBetsByMatchId).toHaveBeenCalledWith(101);
        expect(betsService.getPlacedBetsByMatchId).toHaveBeenCalledWith(102);

        // Verify that settleBetTransaction was called for all 3 bets
        expect(betsService.settleBetTransaction).toHaveBeenCalledTimes(3);

        // Check that the winning and losing bets were settled with the correct outcome
        expect(betsService.settleBetTransaction).toHaveBeenCalledWith(mockBetsForMatch1[0], true); // Bet 1 won
        expect(betsService.settleBetTransaction).toHaveBeenCalledWith(mockBetsForMatch1[1], false); // Bet 2 lost
        expect(betsService.settleBetTransaction).toHaveBeenCalledWith(mockBetsForMatch2[0], true); // Bet 3 won
    });

    it('should not attempt to settle bets if no finished matches are found', async () => {
        pandascoreService.getPastMatches.mockResolvedValue([]);

        await settleAllBets();

        expect(betsService.getPlacedBetsByMatchId).not.toHaveBeenCalled();
        expect(betsService.settleBetTransaction).not.toHaveBeenCalled();
    });

    it('should handle matches that have no placed bets', async () => {
        const mockMatches = [{ id: 102, winner_id: 3 }];
        pandascoreService.getPastMatches.mockResolvedValue(mockMatches);
        betsService.getPlacedBetsByMatchId.mockResolvedValue([]); // No bets for this match

        await settleAllBets();

        expect(betsService.getPlacedBetsByMatchId).toHaveBeenCalledWith(102);
        expect(betsService.settleBetTransaction).not.toHaveBeenCalled();
    });

    it('should continue processing other matches if one fails', async () => {
        const mockMatches = [
            { id: 101, name: 'G2 vs T1', winner_id: 1 },
            { id: 102, name: 'FNC vs JDG', winner_id: 4 }
        ];
        const error = new Error('Failed to fetch bets for this match');

        pandascoreService.getPastMatches.mockResolvedValue(mockMatches);
        betsService.getPlacedBetsByMatchId
            .mockRejectedValueOnce(error) // Fail for match 101
            .mockResolvedValueOnce([]);   // Succeed for match 102

        await settleAllBets();

        // Should have tried to fetch bets for both matches
        expect(betsService.getPlacedBetsByMatchId).toHaveBeenCalledTimes(2);
        // Should not have tried to settle any bets because the first call failed
        // and the second had no bets.
        expect(betsService.settleBetTransaction).not.toHaveBeenCalled();
    });
});
