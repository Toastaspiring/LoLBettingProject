const express = require('express');
const pandascoreService = require('./pandascore.service.js');

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  res.send('Welcome to the LoL Esports Betting Platform API!');
});

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

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
