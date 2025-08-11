const db = require('../database.js');

const seedDatabase = () => {
    console.log('Seeding database with debug data...');

    db.serialize(() => {
        // Use INSERT OR IGNORE to prevent errors if the user already exists.
        // This makes the script safe to run multiple times.
        const sql = `
            INSERT OR IGNORE INTO users (id, riot_id, username, balance)
            VALUES (1, 'debug-user-riot-id', 'DebugUser', 9999);
        `;

        db.run(sql, [], function(err) {
            if (err) {
                return console.error('Error seeding users table:', err.message);
            }
            if (this.changes > 0) {
                console.log('Debug user inserted successfully.');
            } else {
                console.log('Debug user already exists.');
            }
        });
    });
};

// --- Main execution ---
try {
    seedDatabase();
} catch (error) {
    console.error('An error occurred during seeding:', error);
} finally {
    db.close((err) => {
        if (err) {
            console.error('Error closing the database:', err.message);
        }
        console.log('Database connection closed by seeder.');
    });
}
