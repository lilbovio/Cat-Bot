const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    guildId:    { type: String, required: true },
    channelId:  { type: String, required: true, unique: true },
    userId:     { type: String, required: true },
    reason:     { type: String, default: 'Sin motivo' },
    status:     { type: String, enum: ['open', 'closed'], default: 'open' },
    number:     { type: Number, required: true },
    createdAt:  { type: Date, default: Date.now },
    closedAt:   { type: Date, default: null },
    messages:   [{ authorId: String, content: String, timestamp: Date }],
});

ticketSchema.index({ guildId: 1, number: 1 }, { unique: true });

module.exports = mongoose.model('Ticket', ticketSchema);
