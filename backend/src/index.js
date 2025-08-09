const express = require('express');
const pandascoreService = require('./pandascore.service.js');
const betsService = require('./bets.service.js');
const authRouter = require('./auth.router.js');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());

// Session middleware
app.use(session({
    secret: 'a-very-secret-key-that-should-be-in-env-vars', // In production, use an env variable
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // In production, set to true if using HTTPS
}));

// Root endpoint
app.get('/', (req, res) => {
  res.send('Welcome to the LoL Esports Betting Platform API!');
});

// --- Auth Routes ---
app.use('/auth', authRouter);

// An endpoint to get upcoming matches
app.get('/matches/upcoming', async (req, res) => {
    try {
        const matches = await pandascoreService.getUpcomingMatches();
        res.json(matches);
    } catch (error) {
        console.error('Error fetching upcoming matches:', error);
        res.status(500).json({ message: 'An error occurred while fetching upcoming matches.' });
    }
});

// An endpoint to get details for a specific match
app.get('/matches/:id', async (req, res) => {
    try {
        const matchId = req.params.id;
        const matchDetails = await pandascoreService.getMatchDetails(matchId);
        res.json(matchDetails);
    } catch (error) {
        console.error(`Error fetching details for match ${req.params.id}:`, error);
        res.status(500).json({ message: 'An error occurred while fetching match details.' });
    }
});

// --- Betting Endpoints ---

// Place a new bet
app.post('/bets', async (req, res) => {
    try {
        const { userId, matchId, teamId, amount } = req.body;
        if (!userId || !matchId || !teamId || !amount) {
            return res.status(400).json({ message: 'Missing required fields for bet.' });
        }
        const newBet = await betsService.createBet({ userId, matchId, teamId, amount });
        res.status(201).json(newBet);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all bets for a specific user
app.get('/users/:userId/bets', async (req, res) => {
    try {
        const { userId } = req.params;
        const userBets = await betsService.getBetsForUser(userId);
        res.json(userBets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

module.exports = { app, server };
