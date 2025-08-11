const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../data/main.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error(`Error connecting to the database: ${err.message}`);
    throw err;
  }
  console.log('Successfully connected to the SQLite database.');
});

// We can add a function to initialize tables if needed, but it's already done.
// We just need to export the connected db instance for the app to use.
module.exports = db;
