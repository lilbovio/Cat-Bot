// Convierte un texto de duración ("10s", "5m", "1h", "2d") a milisegundos. Devuelve null si es inválido.
function parseDuration(input) {
    if (!input) return null;
    const match = String(input).match(/^(\d+)(s|m|h|d)?$/i);
    if (!match) return null;
    const value = parseInt(match[1], 10);
    const unit = (match[2] || 'm').toLowerCase();
    const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
    return value * multipliers[unit];
}

// Convierte milisegundos a un texto legible ("2 días, 3 horas").
function formatDuration(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const parts = [];
    if (days) parts.push(`${days} día${days !== 1 ? 's' : ''}`);
    if (hours) parts.push(`${hours} hora${hours !== 1 ? 's' : ''}`);
    if (minutes) parts.push(`${minutes} minuto${minutes !== 1 ? 's' : ''}`);
    return parts.join(', ') || '0 minutos';
}

// Convierte "<@123>", "<@!123>", "<#123>", "<@&123>" o un ID crudo a un ID. Devuelve null si no es válido.
function parseId(input) {
    if (!input) return null;
    const mention = String(input).match(/^<[@#&!]+(\d+)>$/);
    if (mention) return mention[1];
    return /^\d{15,20}$/.test(String(input)) ? String(input) : null;
}

// Extrae la primera URL http(s) de un texto, si existe.
function extractUrl(input) {
    if (!input) return null;
    const match = String(input).match(/https?:\/\/[^\s]+/);
    return match ? match[0] : null;
}

module.exports = { parseDuration, formatDuration, parseId, extractUrl };
