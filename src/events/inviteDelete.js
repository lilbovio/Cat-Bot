const { Events, EmbedBuilder } = require('discord.js');
const { guildLog } = require('../utils/guildLog');

module.exports = {
    name: Events.InviteDelete,
    async execute(client, invite) {
        if (!invite.guild) return;

        const embed = new EmbedBuilder()
            .setColor('Orange')
            .setTitle('🔗 Invitación eliminada')
            .addFields(
                { name: '🔗 Código', value: invite.code, inline: true },
                { name: '📺 Canal',  value: invite.channel ? `<#${invite.channel.id}>` : 'Desconocido', inline: true },
            )
            .setFooter({ text: `Servidor: ${invite.guild.name}` })
            .setTimestamp();

        await guildLog(client, invite.guild.id, embed);
    },
};
