const { Events, EmbedBuilder } = require('discord.js');
const { guildLog } = require('../utils/guildLog');

module.exports = {
    name: Events.ChannelUpdate,
    async execute(client, oldChannel, newChannel) {
        if (!newChannel.guild) return;

        const changes = [];

        if (oldChannel.name !== newChannel.name) {
            changes.push({ name: '🔤 Nombre', value: `\`${oldChannel.name}\` → \`${newChannel.name}\``, inline: false });
        }
        if (oldChannel.topic !== newChannel.topic) {
            const oldTopic = oldChannel.topic || '*sin tema*';
            const newTopic = newChannel.topic || '*sin tema*';
            changes.push({ name: '📋 Tema', value: `**Antes:** ${oldTopic.slice(0,400)}\n**Ahora:** ${newTopic.slice(0,400)}`, inline: false });
        }
        if (oldChannel.nsfw !== undefined && oldChannel.nsfw !== newChannel.nsfw) {
            changes.push({ name: '🔞 NSFW', value: newChannel.nsfw ? 'Activado' : 'Desactivado', inline: true });
        }
        if (oldChannel.rateLimitPerUser !== newChannel.rateLimitPerUser) {
            changes.push({ name: '🐢 Slowmode', value: `${oldChannel.rateLimitPerUser}s → ${newChannel.rateLimitPerUser}s`, inline: true });
        }

        if (changes.length === 0) return; // Nothing noteworthy changed

        const embed = new EmbedBuilder()
            .setColor('Blue')
            .setTitle('⚙️ Canal modificado')
            .addFields(
                { name: '📺 Canal', value: `${newChannel} (#${newChannel.name})`, inline: false },
                ...changes,
            )
            .setFooter({ text: `ID: ${newChannel.id}` })
            .setTimestamp();

        await guildLog(client, newChannel.guild.id, embed);
    },
};
