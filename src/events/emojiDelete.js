const { Events, EmbedBuilder, AuditLogEvent } = require('discord.js');
const { guildLog } = require('../utils/guildLog');

module.exports = {
    name: Events.GuildEmojiDelete,
    async execute(client, emoji) {
        let deletedBy = null;
        try {
            await new Promise((r) => setTimeout(r, 500));
            const audit = await emoji.guild.fetchAuditLogs({ type: AuditLogEvent.EmojiDelete, limit: 1 });
            const entry = audit.entries.first();
            if (entry && entry.target?.id === emoji.id && Date.now() - entry.createdTimestamp < 5000) {
                deletedBy = entry.executor;
            }
        } catch { /* no perms */ }

        const embed = new EmbedBuilder()
            .setColor('Red')
            .setTitle('❌ Emoji eliminado')
            .addFields(
                { name: '🏷️ Nombre',      value: emoji.name, inline: true },
                { name: '🔧 Eliminado por', value: deletedBy ? `${deletedBy.username}` : 'Desconocido', inline: true },
            )
            .setFooter({ text: `ID: ${emoji.id}` })
            .setTimestamp();

        await guildLog(client, emoji.guild.id, embed);
    },
};
