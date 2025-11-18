const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');

// This function needs to be passed the Socket.IO instance (io) from server.js
module.exports = (io, activeConnections) => {

    // --- Login Route --- 
    router.post('/login', async (req, res) => {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Successful login: Create and populate session
        req.session.userId = user._id;
        req.session.role = user.role; // Return role for frontend redirect [cite: 12, 13]
        req.session.username = user.username;

        // Emit real-time update for Admin Dashboard [cite: 20, 21]
        io.to('admin').emit('admin:user_logged_in', { 
            username: user.username, 
            role: user.role,
            sessionId: req.session.id,
            // Connected time is not known until socket connects, 
            // but send a notification anyway.
        });

        // Save session changes immediately
        req.session.save(() => {
            res.json({ 
                success: true, 
                role: user.role, // Frontend uses this for routing [cite: 12]
                username: user.username
            });
        });
    });

    // --- Logout Route --- [cite: 10]
    router.post('/logout', (req, res) => {
        const sessionId = req.session.id;

        req.session.destroy(err => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Logout failed' });
            }

            // Real-time Update: Inform admins that a user logged out [cite: 20, 22]
            // We use the sessionId to remove the entry from the client-side list
            io.to('admin').emit('admin:user_logged_out', { sessionId: sessionId });

            // Remove the session from our in-memory tracking map [cite: 28, 30]
            activeConnections.delete(sessionId);

            // Clear the cookie client-side
            res.clearCookie('connect.sid'); 
            res.json({ success: true, message: 'Logged out successfully' });
        });
    });

    return router;
};