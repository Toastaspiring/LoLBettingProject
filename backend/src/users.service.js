const db = require('./database.js');

/**
 * Updates a user's balance by a given amount.
 * Can be a positive or negative number.
 *
 * @param {number} userId - The ID of the user to update.
 * @param {number} amountChange - The amount to add to the user's balance.
 * @param {object} dbConnection - An optional database connection for transactions.
 * @returns {Promise<void>}
 */
const updateUserBalance = (userId, amountChange, dbConnection = db) => {
    return new Promise((resolve, reject) => {
        const sql = `UPDATE users SET balance = balance + ? WHERE id = ?`;
        dbConnection.run(sql, [amountChange, userId], function(err) {
            if (err) {
                return reject(err);
            }
            // In a transaction, we might not have this.changes, so we trust it worked if no error.
            // If not in a transaction and this.changes is 0, it means the user was not found.
            if (!dbConnection.inTransaction && this.changes === 0) {
                return reject(new Error(`User with id ${userId} not found.`));
            }
            resolve();
        });
    });
};

module.exports = {
    updateUserBalance,
};
