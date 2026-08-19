const { Events, EmbedBuilder } = require('discord.js');
const { guildLog } = require('../utils/guildLog');

module.exports = {
    name: Events.MessageUpdate,
    async execute(client, oldMessage, newMessage) {
        if (!newMessage.guild) return;
        if (newMessage.author?.bot) return;
        // Ignore embed-only updates (Discord auto-adds embeds after sending)
        if (oldMessage.content === newMessage.content) return;

        const oldContent = oldMessage.content || '*[sin contenido]*';
        const newContent = newMessage.content || '*[sin contenido]*';

        const trim = (s, max = 1024) => s.length > max ? s.slice(0, max - 3) + '...' : s;

        const embed = new EmbedBuilder()
            .setColor('Yellow')
            .setTitle('✏️ Mensaje editado')
            .setURL(newMessage.url)
            .addFields(
                { name: '👤 Autor',        value: `${newMessage.author.username} (${newMessage.author.id})`, inline: true },
                { name: '📺 Canal',        value: `<#${newMessage.channelId}>`, inline: true },
                { name: '📝 Antes',        value: trim(oldContent), inline: false },
                { name: '📝 Ahora',        value: trim(newContent), inline: false },
            )
            .setFooter({ text: `ID: ${newMessage.id}` })
            .setTimestamp();

        await guildLog(client, newMessage.guild.id, embed);
    },
};
