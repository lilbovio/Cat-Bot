const cooldowns = new Map();

// Devuelve los milisegundos restantes de cooldown para un usuario y comando (0 si no hay).
function getRemaining(userId, command) {
    if (!command.cooldown) return 0;
    const key = `${userId}:${command.name}`;
    const last = cooldowns.get(key) || 0;
    const remaining = last + command.cooldown * 1000 - Date.now();
    return remaining > 0 ? remaining : 0;
}

// Inicia (o renueva) el cooldown de un usuario y comando.
function start(userId, command) {
    if (!command.cooldown) return;
    cooldowns.set(`${userId}:${command.name}`, Date.now());
}

module.exports = { getRemaining, start };
