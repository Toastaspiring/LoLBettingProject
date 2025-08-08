const PANDASCORE_API_TOKEN = process.env.PANDASCORE_API_TOKEN;
const PANDASCORE_API_URL = 'https://api.pandascore.co';

const getUpcomingMatches = async () => {
    if (!PANDASCORE_API_TOKEN) {
        console.warn('PANDA_SCORE_API_TOKEN is not set. Returning mock data.');
        // Returning the same mock data structure for consistency
        return [
            { id: 12345, name: 'G2 Esports vs. T1', scheduled_at: '2025-10-26T14:00:00Z', opponents: [{ opponent: { name: 'G2 Esports' } }, { opponent: { name: 'T1' } }], league: { name: 'Worlds' }, tournament: { name: 'Finals' } },
            { id: 12346, name: 'Fnatic vs. JD Gaming', scheduled_at: '2025-10-26T17:00:00Z', opponents: [{ opponent: { name: 'Fnatic' } }, { opponent: { name: 'JD Gaming' } }], league: { name: 'Worlds' }, tournament: { name: 'Finals' } },
        ];
    }

    const url = `${PANDASCORE_API_URL}/lol/matches/upcoming`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${PANDASCORE_API_TOKEN}`,
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`PandaScore API returned an error: ${response.statusText}`);
        }

        const matches = await response.json();
        return matches;
    } catch (error) {
        console.error('Error fetching upcoming matches from PandaScore:', error);
        // In case of error, we can return an empty array or re-throw the error
        // depending on how we want the frontend to handle it.
        return [];
    }
};

const getMatchDetails = async (matchId) => {
    console.log(`Fetching details for match ${matchId} from PandaScore...`);
    // This is still a mock, to be implemented later.
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

const getPastMatches = async () => {
    if (!PANDASCORE_API_TOKEN) {
        console.warn('PANDA_SCORE_API_TOKEN is not set. Cannot fetch past matches.');
        return [];
    }

    // Sort by end time descending to get the most recently finished matches first.
    const url = `${PANDASCORE_API_URL}/lol/matches/past?sort=-end_at&page[size]=20`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${PANDASCORE_API_TOKEN}`,
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`PandaScore API returned an error: ${response.statusText}`);
        }

        const matches = await response.json();
        return matches.filter(m => m.status === 'finished' && m.winner_id);
    } catch (error) {
        console.error('Error fetching past matches from PandaScore:', error);
        return [];
    }
}

module.exports = {
    getUpcomingMatches,
    getMatchDetails,
    getPastMatches,
};
