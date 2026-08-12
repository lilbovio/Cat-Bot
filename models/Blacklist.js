const mongoose = require('mongoose');

const blacklistSchema = new mongoose.Schema({
    userID: { type: String, required: true, unique: true },
});

module.exports = mongoose.model('Blacklist', blacklistSchema);
