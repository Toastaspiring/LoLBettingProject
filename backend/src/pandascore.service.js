// This service will be responsible for all interactions with the PandaScore API.

const getUpcomingMatches = async () => {
    console.log('Fetching upcoming matches from PandaScore...');
    // In a real implementation, we would use fetch() or a library like axios
    // to make a request to the PandaScore API here.
    // For now, we'll just return some mock data.
    return [
        { id: 12345, name: 'G2 Esports vs. T1', scheduled_at: '2025-10-26T14:00:00Z', status: 'scheduled', tournament: 'World Championship' },
        { id: 12346, name: 'Fnatic vs. JD Gaming', scheduled_at: '2025-10-26T17:00:00Z', status: 'scheduled', tournament: 'World Championship' },
    ];
};

const getMatchDetails = async (matchId) => {
    console.log(`Fetching details for match ${matchId} from PandaScore...`);
    // This would fetch detailed data for a single match.
    return {
        id: matchId,
        name: 'G2 Esports vs. T1',
        status: 'scheduled',
        scheduled_at: '2025-10-26T14:00:00Z',
        team1: { id: 101, name: 'G2 Esports', acronym: 'G2', image_url: 'https://example.com/g2.png' },
        team2: { id: 102, name: 'T1', acronym: 'T1', image_url: 'https://example.com/t1.png' },
        tournament: { name: 'World Championship' },
    };
};

module.exports = {
    getUpcomingMatches,
    getMatchDetails,
};
