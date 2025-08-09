// This file contains the client-side logic for interacting with the backend API.

document.addEventListener('DOMContentLoaded', () => {
    // This function runs when the DOM is fully loaded.

    // --- DOM Element References ---
    const userSection = document.getElementById('user-section');
    const matchesContainer = document.getElementById('matches-container');
    const profileSection = document.getElementById('profile-section');
    const profileInfo = document.getElementById('profile-info');
    const betsContainer = document.getElementById('bets-container');
    const cookieBanner = document.getElementById('cookie-consent-banner');
    const acceptCookiesBtn = document.getElementById('accept-cookies-btn');

    // --- State ---
    let currentUser = null;
    const API_BASE_URL = 'http://localhost:3000'; // Assuming the backend runs on this port

    // --- API Functions ---

    const apiRequest = async (path, options = {}) => {
        try {
            const response = await fetch(`${API_BASE_URL}${path}`, options);
            if (!response.ok) {
                const errorBody = await response.json();
                throw new Error(errorBody.message || 'API request failed');
            }
            return response.json();
        } catch (error) {
            console.error(`API Error on ${path}:`, error);
            alert(`Error: ${error.message}`);
            return null;
        }
    };

    const checkUserStatus = async () => {
        const user = await apiRequest('/auth/me');
        currentUser = user;
        renderUserSection();
        if (user) {
            profileSection.classList.remove('hidden');
            fetchUserBets();
        }
    };

    const fetchUpcomingMatches = async () => {
        const matches = await apiRequest('/matches/upcoming');
        if (matches) {
            renderMatches(matches);
        }
    };

    const fetchUserBets = async () => {
        if (!currentUser) return;
        const bets = await apiRequest(`/users/${currentUser.id}/bets`);
        if (bets) {
            renderUserBets(bets);
        }
    };

    const placeBet = async (matchId, teamId, amount) => {
        if (!currentUser) {
            alert('You must be logged in to place a bet.');
            return;
        }
        await apiRequest('/bets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUser.id, matchId, teamId, amount }),
        });
        alert('Bet placed successfully!');
        fetchUserBets(); // Refresh bets
    };

    // --- Rendering Functions ---

    const renderUserSection = () => {
        userSection.innerHTML = '';
        if (currentUser) {
            profileInfo.innerHTML = `Welcome, <strong>${currentUser.username}</strong>! (Riot ID: ${currentUser.riotId})`;
            const logoutButton = document.createElement('button');
            logoutButton.textContent = 'Logout';
            logoutButton.onclick = async () => {
                await apiRequest('/auth/logout', { method: 'POST' });
                currentUser = null;
                window.location.reload();
            };
            userSection.appendChild(logoutButton);
        } else {
            profileInfo.innerHTML = '';
            const loginButton = document.createElement('button');
            loginButton.textContent = 'Login with Riot';
            loginButton.onclick = () => {
                window.location.href = `${API_BASE_URL}/auth/riot`;
            };
            userSection.appendChild(loginButton);
        }
    };

    const renderMatches = (matches) => {
        matchesContainer.innerHTML = '';
        if (matches.length === 0) {
            matchesContainer.innerHTML = '<p>No upcoming matches found.</p>';
            return;
        }
        matches.forEach(match => {
            const matchEl = document.createElement('div');
            matchEl.className = 'match';

            // Note: The structure of opponents depends on the API response.
            // Assuming `match.opponents` is an array of two.
            const team1 = match.opponents[0]?.opponent || { id: '?', name: 'TBD' };
            const team2 = match.opponents[1]?.opponent || { id: '?', name: 'TBD' };

            matchEl.innerHTML = `
                <div class="teams">${team1.name} vs ${team2.name}</div>
                <div class="tournament">${match.tournament.name} - ${new Date(match.scheduled_at).toLocaleString()}</div>
                <div class="bet-form">
                    <input type="number" placeholder="Amount" min="1" class="bet-amount">
                    <button class="bet-btn" data-team-id="${team1.id}">Bet on ${team1.name}</button>
                    <button class="bet-btn" data-team-id="${team2.id}">Bet on ${team2.name}</button>
                </div>
            `;

            matchEl.querySelectorAll('.bet-btn').forEach(button => {
                button.addEventListener('click', () => {
                    const amount = matchEl.querySelector('.bet-amount').value;
                    if (!amount || amount <= 0) {
                        alert('Please enter a valid amount to bet.');
                        return;
                    }
                    const teamId = button.dataset.teamId;
                    placeBet(match.id, teamId, parseInt(amount));
                });
            });

            matchesContainer.appendChild(matchEl);
        });
    };

    const renderUserBets = (bets) => {
        betsContainer.innerHTML = '';
        if (bets.length === 0) {
            betsContainer.innerHTML = '<p>You have not placed any bets.</p>';
            return;
        }
        bets.forEach(bet => {
            const betEl = document.createElement('div');
            betEl.className = 'bet';
            betEl.innerHTML = `
                <p><strong>Match ID:</strong> ${bet.match_id}</p>
                <p><strong>Team ID:</strong> ${bet.team_id}</p>
                <p><strong>Amount:</strong> ${bet.amount}</p>
                <p><strong>Status:</strong> <span class="status-${bet.status}">${bet.status}</span></p>
            `;
            betsContainer.appendChild(betEl);
        });
    };

    // --- Event Listeners ---

    acceptCookiesBtn.addEventListener('click', () => {
        cookieBanner.classList.add('hidden');
        localStorage.setItem('cookieConsent', 'true');
    });

    // --- Initial Load ---
    const init = () => {
        console.log('App initialized.');
        if (!localStorage.getItem('cookieConsent')) {
            cookieBanner.classList.remove('hidden');
        }

        checkUserStatus();
        fetchUpcomingMatches();
    };

    init();
});
