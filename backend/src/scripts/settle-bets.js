const { settleAllBets } = require('../settle.service.js');
const db = require('../database.js');

console.log('Running the manual bet settlement script...');

settleAllBets()
    .then(() => {
        console.log('Script finished successfully.');
    })
    .catch((err) => {
        console.error('Script encountered an error:', err);
    })
    .finally(() => {
        db.close((err) => {
            if (err) {
                console.error('Error closing the database:', err.message);
            }
            console.log('Database connection closed by settlement script.');
        });
    });
