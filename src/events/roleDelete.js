const { Events, EmbedBuilder, AuditLogEvent } = require('discord.js');
const { guildLog } = require('../utils/guildLog');

module.exports = {
    name: Events.GuildRoleDelete,
    async execute(client, role) {
        let deletedBy = null;
        try {
            await new Promise((r) => setTimeout(r, 500));
            const audit = await role.guild.fetchAuditLogs({ type: AuditLogEvent.RoleDelete, limit: 1 });
            const entry = audit.entries.first();
            if (entry && entry.target?.id === role.id && Date.now() - entry.createdTimestamp < 5000) {
                deletedBy = entry.executor;
            }
        } catch { /* no perms */ }

        const embed = new EmbedBuilder()
            .setColor('Red')
            .setTitle('🔴 Rol eliminado')
            .addFields(
                { name: '🏷️ Nombre',     value: role.name, inline: true },
                { name: '🎨 Color',      value: role.hexColor, inline: true },
                { name: '🔧 Eliminado por', value: deletedBy ? `${deletedBy.username}` : 'Desconocido', inline: true },
            )
            .setFooter({ text: `ID: ${role.id}` })
            .setTimestamp();

        await guildLog(client, role.guild.id, embed);
    },
};
