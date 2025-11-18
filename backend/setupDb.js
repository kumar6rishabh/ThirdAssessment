const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User'); // Import your User model

const DB_URL = 'mongodb://localhost:27017/session_assessment';
const SALT_ROUNDS = 10; // Use the same salt rounds as in your User model

const testUsers = [
    { 
        username: 'adminuser', 
        password: 'adminpassword123', 
        role: 'admin' 
    },
    { 
        username: 'normaluser', 
        password: 'userpassword123', 
        role: 'user' 
    }
];

async function setupDatabase() {
    console.log('--- Database Setup Starting ---');
    try {
        // 1. Connect to MongoDB
        await mongoose.connect(DB_URL);
        console.log('MongoDB connected.');

        // 2. Clear existing users for a clean test environment
        await User.deleteMany({});
        console.log('Existing users cleared.');

        const usersToInsert = [];

        // 3. Hash passwords and prepare for insertion
        for (const user of testUsers) {
            const passwordHash = await bcrypt.hash(user.password, SALT_ROUNDS);
            usersToInsert.push({
                username: user.username,
                passwordHash: passwordHash, // Use passwordHash field defined in model
                role: user.role
            });
            console.log(`Hashed password for ${user.username}`);
        }

        // 4. Insert users into the collection
        await User.insertMany(usersToInsert);
        console.log(`Successfully created ${usersToInsert.length} test users.`);
        console.log('--- Database Setup Complete ---');

    } catch (error) {
        console.error('Database setup failed:', error.message);
    } finally {
        // 5. Disconnect
        await mongoose.disconnect();
    }
}

setupDatabase();