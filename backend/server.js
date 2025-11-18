const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo'); 
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const authRoutes = require('./routes/authRoutes');
const cors = require('cors');

// --- 1. Database and Server Setup ---
const PORT = 3000;
const DB_URL = 'mongodb://localhost:27017/session_assessment';

mongoose.connect(DB_URL)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

const app = express();
const server = http.createServer(app);

// --- 2. Session Middleware Configuration ---
const sessionMiddleware = session({
    secret: 'A_SECURE_SECRET_KEY_FOR_SESSIONS', 
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ // Stores sessions in MongoDB
        mongoUrl: DB_URL,
        collectionName: 'sessions', 
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        httpOnly: true, // Prevent client-side JS access
        // Set secure to true if NOT running on localhost/HTTP:
        secure: process.env.NODE_ENV === 'production', 
        sameSite: 'lax', 
    },
});

app.use(cors({
    origin: 'http://localhost:5173', // Allows external clients (like Vue frontend or test tools)
    credentials: true 
}));
app.use(express.json());
app.use(sessionMiddleware);


// --- 3. Socket.IO Setup ---
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173', 
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Pass the session to the socket connection
io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
});

// In-memory map for tracking active, authenticated users
// Key: Session ID, Value: { username, role, connectedTime }
const activeConnections = new Map(); 

// --- 4. Socket.IO Real-Time Tracking Logic ---
io.on('connection', (socket) => {
    const session = socket.request.session;
    const sessionId = session.id;

    if (session.userId) { // Check if the session is authenticated
        const connectionData = {
            sessionId: sessionId,
            username: session.username,
            role: session.role,
            connectedTime: new Date().toISOString()
        };

        // Add/update the connection map
        activeConnections.set(sessionId, connectionData);
        
        // Broadcast data to all existing admins *before* handling the new client:
        const loginEventData = { ...connectionData, eventType: 'login' };
        socket.broadcast.to('admin').emit('admin:user_logged_in', loginEventData);

        // If the connecting user is an admin
        if (session.role === 'admin') {
            socket.join('admin'); 
            
            // 1. Initial Data Load (Sent ONLY to the newly connected admin)
            socket.emit('admin:active_users_update', Array.from(activeConnections.values()));
        } 
        
    } else {
        // Disconnect unauthenticated sockets
        socket.disconnect();
        return;
    }

    // --- 5. Disconnect Detection ---
    socket.on('disconnect', () => {
        if (session.userId) {
            // Remove the connection from the map
            activeConnections.delete(sessionId);

            // Notify all admins of the user disconnect
            io.to('admin').emit('admin:user_disconnected', { 
                sessionId: sessionId,
                username: session.username
            });
        }
    });
});

// --- 6. Routing and Start Server ---
app.use('/api/auth', authRoutes(io, activeConnections));

server.listen(PORT, () => console.log(`Backend listening on http://localhost:${PORT}`));