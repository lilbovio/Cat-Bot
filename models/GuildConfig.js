const mongoose = require('mongoose');

const guildConfigSchema = new mongoose.Schema({
    guildId:         { type: String, required: true, unique: true },
    prefix:          { type: String, default: '!' },
    welcomeChannel:  { type: String, default: null },
    welcomeMessage:  { type: String, default: null },
    welcomeImage:    { type: String, default: null },
    logsChannel:     { type: String, default: null },
    autoRole:        { type: String, default: null },
    levelingEnabled: { type: Boolean, default: true },

    // ── Ticket system ─────────────────────────────────────────────────────────
    ticketCategory:   { type: String, default: null },   // category ID for ticket channels
    ticketLogChannel: { type: String, default: null },   // channel to log ticket events
    supportRole:      { type: String, default: null },   // role that can see all tickets
    ticketCounter:    { type: Number, default: 0 },      // auto-increment per guild

    // ── Automod ───────────────────────────────────────────────────────────────
    automod: {
        enabled:      { type: Boolean, default: false },
        filterLinks:  { type: Boolean, default: false },
        filterInvites:{ type: Boolean, default: false },
        filterSpam:   { type: Boolean, default: false },  // 5+ identical messages in 10s
        badWords:     { type: [String], default: [] },
        // action when triggered: 'delete' | 'warn' | 'timeout'
        action:       { type: String, default: 'delete' },
        // channels/roles exempt from automod
        exemptChannels: { type: [String], default: [] },
        exemptRoles:    { type: [String], default: [] },
    },
});

module.exports = mongoose.model('GuildConfig', guildConfigSchema);
