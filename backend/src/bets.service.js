const db = require('./database.js');
const { updateUserBalance } = require('./users.service.js');

/**
 * Creates a new bet in the database.
 * In a real application, this function would also involve checking the user's balance
 * and wrapping the balance deduction and bet creation in a database transaction
 * to ensure atomicity.
 *
 * @param {number} userId - The ID of the user placing the bet.
 * @param {number} matchId - The ID of the match being bet on.
 * @param {number} teamId - The ID of the team being bet on.
 * @param {number} amount - The amount being wagered.
 * @returns {Promise<object>} A promise that resolves with the newly created bet object.
 */
const createBet = ({ userId, matchId, teamId, amount }) => {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO bets (user_id, match_id, team_id, amount) VALUES (?, ?, ?, ?)`;
        db.run(sql, [userId, matchId, teamId, amount], function(err) {
            if (err) {
                console.error('Error creating bet:', err.message);
                return reject(new Error('Failed to place bet.'));
            }
            // this.lastID is a property of the sqlite driver that gives the ID of the last inserted row.
            resolve({ id: this.lastID, userId, matchId, teamId, amount, status: 'placed' });
        });
    });
};

/**
 * Retrieves all bets for a given user.
 * @param {number} userId - The ID of the user whose bets to retrieve.
 * @returns {Promise<Array>} A promise that resolves with an array of the user's bets.
 */
const getBetsForUser = (userId) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM bets WHERE user_id = ? ORDER BY created_at DESC`;
        db.all(sql, [userId], (err, rows) => {
            if (err) {
                console.error('Error fetching bets for user:', err.message);
                return reject(new Error('Failed to retrieve bets.'));
            }
            resolve(rows);
        });
    });
};

const getPlacedBetsByMatchId = (matchId) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM bets WHERE match_id = ? AND status = 'placed'`;
        db.all(sql, [matchId], (err, rows) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
};

/**
 * Settles a single bet, updating its status and paying out winnings to the user
 * inside a database transaction.
 * @param {object} bet - The bet object to settle.
 * @param {boolean} didWin - Whether the user won the bet.
 * @returns {Promise<void>}
 */
const settleBetTransaction = (bet, didWin) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION;', (err) => {
                if (err) return reject(err);

                const newStatus = didWin ? 'won' : 'lost';
                const winnings = didWin ? bet.amount * 2 : 0; // Assuming 1:1 odds for now

                // Step 1: Update the bet status
                db.run(`UPDATE bets SET status = ? WHERE id = ?`, [newStatus, bet.id], function(err) {
                    if (err) {
                        db.run('ROLLBACK;');
                        return reject(err);
                    }

                    // Step 2: If the user won, update their balance
                    if (didWin) {
                        updateUserBalance(bet.user_id, winnings, db)
                            .then(() => {
                                db.run('COMMIT;', (err) => err ? reject(err) : resolve());
                            })
                            .catch(err => {
                                db.run('ROLLBACK;');
                                reject(err);
                            });
                    } else {
                        // If they lost, no balance change, so just commit
                        db.run('COMMIT;', (err) => err ? reject(err) : resolve());
                    }
                });
            });
        });
    });
};


module.exports = {
    createBet,
    getBetsForUser,
    getPlacedBetsByMatchId,
    settleBetTransaction,
};
