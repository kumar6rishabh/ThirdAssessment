const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['admin', 'user'], 
        required: true 
    } // Required for role-based routing [cite: 12]
});

// Middleware to hash password before saving (e.g., on user creation)
UserSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.passwordHash = await bcrypt.hash(this.password, 10);
    }
    next();
});

module.exports = mongoose.model('User', UserSchema);