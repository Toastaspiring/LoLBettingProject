const pandascoreService = require('./pandascore.service.js');
const betsService = require('./bets.service.js');

const settleAllBets = async () => {
    console.log('Starting bet settlement process...');

    try {
        const finishedMatches = await pandascoreService.getPastMatches();
        if (finishedMatches.length === 0) {
            console.log('No recently finished matches found to settle.');
            return;
        }

        console.log(`Found ${finishedMatches.length} finished matches to process.`);

        for (const match of finishedMatches) {
            // Ensure the match has a winner before processing
            if (!match.winner_id) {
                console.log(`Match ${match.name} (ID: ${match.id}) has no winner_id. Skipping.`);
                continue;
            }

            console.log(`Processing match: ${match.name} (ID: ${match.id}), Winner ID: ${match.winner_id}`);
            const placedBets = await betsService.getPlacedBetsByMatchId(match.id);

            if (placedBets.length === 0) {
                console.log(`No placed bets found for match ${match.id}.`);
                continue;
            }

            console.log(`Found ${placedBets.length} bets for match ${match.id}.`);

            for (const bet of placedBets) {
                const didWin = bet.team_id === match.winner_id;
                console.log(`  - Settling bet ID ${bet.id}: User ${bet.user_id} ${didWin ? 'won' : 'lost'}.`);
                try {
                    await betsService.settleBetTransaction(bet, didWin);
                    console.log(`    ... Bet ${bet.id} settled successfully.`);
                } catch (error) {
                    console.error(`    ... Failed to settle bet ${bet.id}:`, error);
                    // Continue to the next bet even if one fails
                }
            }
        }
    } catch (error) {
        console.error('An error occurred during the bet settlement process:', error);
    }

    console.log('Bet settlement process finished.');
};

module.exports = {
    settleAllBets,
};
