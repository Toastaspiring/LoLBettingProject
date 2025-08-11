const express = require('express');
const router = express.Router();
const usersService = require('./users.service.js');

// Middleware to check if a user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.status(401).json({ message: 'You must be logged in to perform this action.' });
    }
};

// Middleware to check if the logged-in user is the one being modified
const isCurrentUser = (req, res, next) => {
    if (req.session.user.id == req.params.userId) {
        next();
    } else {
        res.status(403).json({ message: 'You are not authorized to perform this action on another user.' });
    }
};

// DELETE /users/:userId - Delete a user's account
// A user must be logged in, and can only delete their own account.
router.delete('/:userId', isAuthenticated, isCurrentUser, async (req, res) => {
    try {
        await usersService.deleteUser(req.params.userId);
        // Destroy the session on successful deletion
        req.session.destroy(err => {
            if (err) {
                // Still send a success response, but log the session error
                console.error("Session could not be destroyed after user deletion.", err);
                return res.status(200).json({ message: 'Account deleted successfully, but failed to log out.' });
            }
            res.clearCookie('connect.sid');
            res.status(200).json({ message: 'Account deleted successfully.' });
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
