const db = require('./database.js');
const betsService = require('./bets.service.js');
const usersService = require('./users.service.js');

// Mock the entire database module
jest.mock('./database.js', () => ({
    run: jest.fn(),
    all: jest.fn(),
    // Mock serialize to just execute the callback immediately
    serialize: jest.fn((callback) => callback()),
}));

// Mock the users service
jest.mock('./users.service.js');

describe('Bets Service', () => {
    // Clear all mocks before each test to ensure test isolation
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createBet', () => {
        it('should insert a bet and resolve with the new bet object', async () => {
            const betData = { userId: 1, matchId: 1, teamId: 1, amount: 100 };
            // Mock the db.run callback to simulate a successful insert
            db.run.mockImplementation(function(sql, params, callback) {
                this.lastID = 99; // Simulate setting the lastID property
                callback(null);
            });

            const result = await betsService.createBet(betData);
            expect(db.run).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO bets'), [1, 1, 1, 100], expect.any(Function));
            expect(result).toEqual({ id: 99, userId: 1, matchId: 1, teamId: 1, amount: 100, status: 'placed' });
        });

        it('should reject if the database insert fails', async () => {
            const betData = { userId: 1, matchId: 1, teamId: 1, amount: 100 };
            const dbError = new Error('SQLITE_CONSTRAINT');
            db.run.mockImplementation((sql, params, callback) => callback(dbError));

            await expect(betsService.createBet(betData)).rejects.toThrow('Failed to place bet.');
        });
    });

    describe('getPlacedBetsByMatchId', () => {
        it('should retrieve all placed bets for a given match ID', async () => {
            const mockBets = [{ id: 1, status: 'placed' }, { id: 2, status: 'placed' }];
            db.all.mockImplementation((sql, params, callback) => {
                callback(null, mockBets);
            });

            const result = await betsService.getPlacedBetsByMatchId(123);
            expect(db.all).toHaveBeenCalledWith(expect.stringContaining("status = 'placed'"), [123], expect.any(Function));
            expect(result).toEqual(mockBets);
        });
    });

    describe('settleBetTransaction', () => {
        it('should COMMIT a winning bet and update user balance', async () => {
            const bet = { id: 1, user_id: 1, amount: 100 };
            usersService.updateUserBalance.mockResolvedValue();
            // Mock db.run to succeed for all its calls within the transaction
            db.run.mockImplementation((sql, params, callback) => callback && callback(null));

            await betsService.settleBetTransaction(bet, true);

            // Check that the transaction was started, the bet was updated, the balance was updated, and the transaction was committed
            expect(db.run).toHaveBeenCalledWith('BEGIN TRANSACTION;', expect.any(Function));
            expect(db.run).toHaveBeenCalledWith(`UPDATE bets SET status = ? WHERE id = ?`, ['won', 1], expect.any(Function));
            expect(usersService.updateUserBalance).toHaveBeenCalledWith(1, 200, db);
            expect(db.run).toHaveBeenCalledWith('COMMIT;', expect.any(Function));
            expect(db.run).not.toHaveBeenCalledWith('ROLLBACK;');
        });

        it('should COMMIT a losing bet without updating balance', async () => {
            const bet = { id: 2, user_id: 2, amount: 50 };
            db.run.mockImplementation((sql, params, callback) => callback && callback(null));

            await betsService.settleBetTransaction(bet, false);

            expect(db.run).toHaveBeenCalledWith('BEGIN TRANSACTION;', expect.any(Function));
            expect(db.run).toHaveBeenCalledWith(`UPDATE bets SET status = ? WHERE id = ?`, ['lost', 2], expect.any(Function));
            expect(usersService.updateUserBalance).not.toHaveBeenCalled();
            expect(db.run).toHaveBeenCalledWith('COMMIT;', expect.any(Function));
            expect(db.run).not.toHaveBeenCalledWith('ROLLBACK;');
        });

        it('should ROLLBACK if updating the bet status fails', async () => {
            const bet = { id: 1, user_id: 1, amount: 100 };
            const dbError = new Error('DB Error');
            // Mock db.run to fail only on the UPDATE statement
            db.run.mockImplementation((sql, params, callback) => {
                 if (sql.includes('UPDATE bets')) {
                    callback(dbError);
                } else {
                    callback(null);
                }
            });

            // We expect the promise to reject with the error
            await expect(betsService.settleBetTransaction(bet, true)).rejects.toEqual(dbError);

            expect(db.run).toHaveBeenCalledWith('ROLLBACK;');
            expect(db.run).not.toHaveBeenCalledWith('COMMIT;', expect.any(Function));
        });

        it('should ROLLBACK if updating the user balance fails', async () => {
            const bet = { id: 1, user_id: 1, amount: 100 };
            const balanceError = new Error('Balance Error');
            usersService.updateUserBalance.mockRejectedValue(balanceError);
            db.run.mockImplementation((sql, params, callback) => callback(null));

            await expect(betsService.settleBetTransaction(bet, true)).rejects.toEqual(balanceError);

            expect(db.run).toHaveBeenCalledWith('ROLLBACK;');
            expect(db.run).not.toHaveBeenCalledWith('COMMIT;', expect.any(Function));
        });
    });
});
