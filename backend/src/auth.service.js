const usersService = require('./users.service.js');

/**
 * Finds a user by their Riot ID, or creates a new one if they don't exist.
 * @param {object} profile - A mock user profile object.
 * @param {string} profile.riotId - The user's Riot ID.
 * @param {string} profile.username - The user's username.
 * @returns {Promise<object>} The found or newly created user object.
 */
const findOrCreateUser = async ({ riotId, username }) => {
    try {
        let user = await usersService.findUserByRiotId(riotId);

        if (!user) {
            console.log(`User with Riot ID ${riotId} not found. Creating new user.`);
            user = await usersService.createUser(riotId, username);
        } else {
            console.log(`Found user with Riot ID ${riotId}.`);
        }

        return user;
    } catch (error) {
        console.error('Error in findOrCreateUser:', error);
        throw new Error('Failed to find or create user.');
    }
};

module.exports = {
    findOrCreateUser,
};
