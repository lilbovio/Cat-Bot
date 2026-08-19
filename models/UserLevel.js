const mongoose = require('mongoose');

const userLevelSchema = new mongoose.Schema({
    guildId:  { type: String, required: true },
    userId:   { type: String, required: true },
    xp:       { type: Number, default: 0 },      // XP acumulado total
    level:    { type: Number, default: 0 },      // Nivel actual
    messages: { type: Number, default: 0 },      // Mensajes totales enviados
});

// XP necesario para pasar del nivel `n` al siguiente (misma fórmula que MEE6)
userLevelSchema.statics.xpForLevel = function (n) {
    return 5 * n * n + 50 * n + 100;
};

module.exports = mongoose.model('UserLevel', userLevelSchema);
