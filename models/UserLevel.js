const mongoose = require('mongoose');

const userLevelSchema = new mongoose.Schema({
    guildId: { type: String, required: true }, // ID del servidor
    userId: { type: String, required: true }, // ID del usuario
    messages: { type: Number, default: 0 },   // Número de mensajes enviados
    level: { type: Number, default: 0 },      // Nivel del usuario
});

module.exports = mongoose.model('UserLevel', userLevelSchema);
