const { Events, EmbedBuilder, AuditLogEvent } = require('discord.js');
const { guildLog } = require('../utils/guildLog');

module.exports = {
    name: Events.GuildRoleCreate,
    async execute(client, role) {
        let creator = null;
        try {
            await new Promise((r) => setTimeout(r, 500));
            const audit = await role.guild.fetchAuditLogs({ type: AuditLogEvent.RoleCreate, limit: 1 });
            const entry = audit.entries.first();
            if (entry && entry.target?.id === role.id && Date.now() - entry.createdTimestamp < 5000) {
                creator = entry.executor;
            }
        } catch { /* no perms */ }

        const embed = new EmbedBuilder()
            .setColor(role.hexColor || 'Blue')
            .setTitle('🟢 Rol creado')
            .addFields(
                { name: '🏷️ Nombre',   value: `${role} (${role.name})`, inline: true },
                { name: '🎨 Color',    value: role.hexColor,             inline: true },
                { name: '🔧 Creado por', value: creator ? `${creator.username}` : 'Desconocido', inline: true },
                { name: '📌 Mencionable', value: role.mentionable ? 'Sí' : 'No', inline: true },
                { name: '📋 Visible',     value: role.hoist ? 'Sí' : 'No', inline: true },
            )
            .setFooter({ text: `ID: ${role.id}` })
            .setTimestamp();

        await guildLog(client, role.guild.id, embed);
    },
};
