const { Events, EmbedBuilder } = require('discord.js');
const { guildLog } = require('../utils/guildLog');

module.exports = {
    name: Events.GuildRoleUpdate,
    async execute(client, oldRole, newRole) {
        const changes = [];

        if (oldRole.name !== newRole.name) {
            changes.push({ name: '🔤 Nombre', value: `\`${oldRole.name}\` → \`${newRole.name}\``, inline: false });
        }
        if (oldRole.hexColor !== newRole.hexColor) {
            changes.push({ name: '🎨 Color', value: `\`${oldRole.hexColor}\` → \`${newRole.hexColor}\``, inline: true });
        }
        if (oldRole.permissions.bitfield !== newRole.permissions.bitfield) {
            const added   = newRole.permissions.toArray().filter((p) => !oldRole.permissions.toArray().includes(p));
            const removed = oldRole.permissions.toArray().filter((p) => !newRole.permissions.toArray().includes(p));
            if (added.length)   changes.push({ name: '✅ Permisos añadidos',   value: added.join(', ').slice(0, 1024),   inline: false });
            if (removed.length) changes.push({ name: '❌ Permisos removidos', value: removed.join(', ').slice(0, 1024),  inline: false });
        }
        if (oldRole.hoist !== newRole.hoist) {
            changes.push({ name: '📋 Visible separado', value: newRole.hoist ? 'Activado' : 'Desactivado', inline: true });
        }
        if (oldRole.mentionable !== newRole.mentionable) {
            changes.push({ name: '📌 Mencionable', value: newRole.mentionable ? 'Sí' : 'No', inline: true });
        }

        if (changes.length === 0) return;

        const embed = new EmbedBuilder()
            .setColor('Yellow')
            .setTitle('⚙️ Rol modificado')
            .addFields(
                { name: '🏷️ Rol', value: `${newRole} (${newRole.name})`, inline: false },
                ...changes,
            )
            .setFooter({ text: `ID: ${newRole.id}` })
            .setTimestamp();

        await guildLog(client, newRole.guild.id, embed);
    },
};
