const config = require('../../config');

// Verifica que un miembro tenga todos los permisos requeridos (array de PermissionFlagsBits).
function hasPermissions(member, permissions) {
    if (!permissions || permissions.length === 0) return true;
    return member.permissions.has(permissions);
}

// Verifica si un usuario es el creador del bot.
function isOwner(userId) {
    return userId === config.adminID;
}

module.exports = { hasPermissions, isOwner };
