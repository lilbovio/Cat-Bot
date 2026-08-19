const { Events, EmbedBuilder } = require('discord.js');
const { guildLog } = require('../utils/guildLog');

module.exports = {
    name: Events.MessageDelete,
    async execute(client, message) {
        // Ignore bot messages, DMs, and uncached messages with no useful info
        if (!message.guild) return;
        if (message.author?.bot) return;

        const content = message.content || '*[mensaje sin texto / solo adjuntos]*';
        const truncated = content.length > 1024 ? content.slice(0, 1021) + '...' : content;

        const embed = new EmbedBuilder()
            .setColor('Red')
            .setTitle('🗑️ Mensaje eliminado')
            .addFields(
                { name: '👤 Autor',   value: message.author ? `${message.author.username} (${message.author.id})` : 'Desconocido', inline: true },
                { name: '📺 Canal',   value: `<#${message.channelId}>`, inline: true },
                { name: '💬 Contenido', value: truncated, inline: false },
            )
            .setFooter({ text: `ID del mensaje: ${message.id}` })
            .setTimestamp();

        // Attachments
        if (message.attachments?.size > 0) {
            embed.addFields({
                name: '📎 Adjuntos',
                value: message.attachments.map((a) => `[${a.name}](${a.url})`).join('\n').slice(0, 1024),
                inline: false,
            });
        }

        await guildLog(client, message.guild.id, embed);
    },
};
