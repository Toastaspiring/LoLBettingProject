const express = require('express');
const router = express.Router();
const authService = require('./auth.service.js');

/**
 * Step 1: /auth/riot
 * The user clicks "Login with Riot" on the frontend, which navigates to this endpoint.
 * In a real OAuth flow, this route would redirect the user to Riot's official login page.
 * For our placeholder, we simulate an instant, successful login and redirect
 * directly to our own callback URL, passing mock user data.
 */
router.get('/riot', (req, res) => {
    // This is the mock user profile we are simulating receiving from Riot.
    // In a real scenario, we wouldn't get this until after the user logs in on Riot's site
    // and we exchange an authorization code for an access token and user data.
    const mockProfile = {
        riotId: 'mock-riot-id-123',
        username: 'MockUser'
    };

    // To simulate the redirect flow, we'll pass the profile data as a query parameter.
    // It's encoded to ensure it's a valid URL string.
    const profileQuery = encodeURIComponent(JSON.stringify(mockProfile));
    res.redirect(`/auth/riot/callback?profile=${profileQuery}`);
});

/**
 * Step 2: /auth/riot/callback
 * In a real flow, Riot would redirect the user here after they log in.
 * In our simulated flow, our own /auth/riot route redirects here.
 * This endpoint processes the user profile, logs them into our app, and creates a session.
 */
router.get('/riot/callback', async (req, res) => {
    try {
        const mockProfile = JSON.parse(decodeURIComponent(req.query.profile));

        // Use the auth service to find a user in our DB with this profile, or create one.
        const user = await authService.findOrCreateUser(mockProfile);

        // Create a session for the user.
        // We only store essential, non-sensitive information in the session.
        req.session.user = {
            id: user.id,
            username: user.username,
            riotId: user.riot_id,
        };

        // In a real app, you would redirect to a frontend URL, e.g., res.redirect('/dashboard')
        res.status(200).json({ message: 'Login successful!', user: req.session.user });
    } catch (error) {
        res.status(500).send(`<h1>Authentication Error</h1><p>${error.message}</p>`);
    }
});

// A route to check the current user status
router.get('/me', (req, res) => {
    if (req.session.user) {
        res.json(req.session.user);
    } else {
        res.status(401).json({ message: 'Not logged in' });
    }
});

// A route to log out
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Could not log out, please try again.' });
        }
        res.clearCookie('connect.sid'); // The default session cookie name
        res.status(200).json({ message: 'Logout successful' });
    });
});


module.exports = router;
