const { Events, EmbedBuilder } = require('discord.js');
const { guildLog } = require('../utils/guildLog');

module.exports = {
    name: Events.InviteCreate,
    async execute(client, invite) {
        if (!invite.guild) return;

        const expires = invite.expiresAt
            ? `<t:${Math.floor(invite.expiresAt.getTime() / 1000)}:R>`
            : 'Nunca';

        const embed = new EmbedBuilder()
            .setColor('Blue')
            .setTitle('🔗 Invitación creada')
            .addFields(
                { name: '🔗 Código',      value: invite.code,  inline: true },
                { name: '👤 Creada por',  value: invite.inviter ? `${invite.inviter.username}` : 'Desconocido', inline: true },
                { name: '📺 Canal',       value: invite.channel ? `<#${invite.channel.id}>` : 'Desconocido', inline: true },
                { name: '🔢 Usos máx.',   value: invite.maxUses ? `${invite.maxUses}` : 'Ilimitados', inline: true },
                { name: '⏰ Expira',       value: expires, inline: true },
            )
            .setFooter({ text: `Servidor: ${invite.guild.name}` })
            .setTimestamp();

        await guildLog(client, invite.guild.id, embed);
    },
};
