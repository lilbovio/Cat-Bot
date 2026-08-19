const { Events, EmbedBuilder, AuditLogEvent } = require('discord.js');
const { guildLog } = require('../utils/guildLog');

module.exports = {
    name: Events.GuildEmojiCreate,
    async execute(client, emoji) {
        let creator = null;
        try {
            await new Promise((r) => setTimeout(r, 500));
            const audit = await emoji.guild.fetchAuditLogs({ type: AuditLogEvent.EmojiCreate, limit: 1 });
            const entry = audit.entries.first();
            if (entry && entry.target?.id === emoji.id && Date.now() - entry.createdTimestamp < 5000) {
                creator = entry.executor;
            }
        } catch { /* no perms */ }

        const embed = new EmbedBuilder()
            .setColor('Green')
            .setTitle('😀 Emoji añadido')
            .setThumbnail(emoji.imageURL())
            .addFields(
                { name: '🏷️ Nombre',    value: emoji.name,  inline: true },
                { name: '🖼️ Vista previa', value: `${emoji}`, inline: true },
                { name: '🔧 Añadido por', value: creator ? `${creator.username}` : 'Desconocido', inline: true },
            )
            .setFooter({ text: `ID: ${emoji.id}` })
            .setTimestamp();

        await guildLog(client, emoji.guild.id, embed);
    },
};
