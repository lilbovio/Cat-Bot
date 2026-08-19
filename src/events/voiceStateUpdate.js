const { Events, EmbedBuilder } = require('discord.js');
const { guildLog } = require('../utils/guildLog');

module.exports = {
    name: Events.VoiceStateUpdate,
    async execute(client, oldState, newState) {
        const member = newState.member || oldState.member;
        if (!member || member.user.bot) return;

        const oldChannel = oldState.channel;
        const newChannel = newState.channel;

        if (oldChannel?.id === newChannel?.id) {
            // Same channel — mute/deaf changes, not worth logging
            return;
        }

        let title, color, fields;

        if (!oldChannel && newChannel) {
            // Joined
            title  = '🔊 Entró a canal de voz';
            color  = 'Green';
            fields = [
                { name: '👤 Usuario', value: `${member.user.username} (${member.id})`, inline: true },
                { name: '🔊 Canal',   value: `${newChannel.name}`,               inline: true },
            ];
        } else if (oldChannel && !newChannel) {
            // Left
            title  = '🔇 Salió de canal de voz';
            color  = 'Grey';
            fields = [
                { name: '👤 Usuario', value: `${member.user.username} (${member.id})`, inline: true },
                { name: '🔇 Canal',   value: `${oldChannel.name}`,               inline: true },
            ];
        } else {
            // Moved
            title  = '🔀 Cambió de canal de voz';
            color  = 'Blue';
            fields = [
                { name: '👤 Usuario', value: `${member.user.username} (${member.id})`, inline: false },
                { name: '📤 Desde',   value: `${oldChannel.name}`,               inline: true  },
                { name: '📥 Hacia',   value: `${newChannel.name}`,               inline: true  },
            ];
        }

        const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle(title)
            .addFields(...fields)
            .setThumbnail(member.user.displayAvatarURL())
            .setFooter({ text: `ID: ${member.id}` })
            .setTimestamp();

        await guildLog(client, (newState.guild || oldState.guild).id, embed);
    },
};
