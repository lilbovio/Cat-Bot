const { Schema, model } = require('mongoose');

const WarnSchema = new Schema({
    guildId: String,
    userId: String,
    warns: [
        {
            reason: String,
            moderatorId: String,
            date: { type: Date, default: Date.now }
        }
    ]
});

module.exports = model('Warn', WarnSchema);
