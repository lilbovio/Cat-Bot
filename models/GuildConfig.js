const mongoose = require('mongoose');

const guildConfigSchema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    prefix: { type: String, default: '!' },
    welcomeChannel: { type: String, default: null },
    welcomeMessage: { type: String, default: null },
    welcomeImage: { type: String, default: null },
    logsChannel: { type: String, default: null }, // Canal para logs
    levelingEnabled: { type: Boolean, default: true }, // Sistema de nivelación
});
module.exports = mongoose.model('GuildConfig', guildConfigSchema);
