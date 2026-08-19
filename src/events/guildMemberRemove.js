const { Events, EmbedBuilder, AuditLogEvent } = require('discord.js');
const { guildLog } = require('../utils/guildLog');

module.exports = {
    name: Events.GuildMemberRemove,
    async execute(client, member) {
        // Try to detect if this was a kick via audit log
        let kickedBy = null;
        try {
            await new Promise((r) => setTimeout(r, 500)); // wait for audit log to populate
            const audit = await member.guild.fetchAuditLogs({ type: AuditLogEvent.MemberKick, limit: 1 });
            const entry = audit.entries.first();
            if (entry && entry.target?.id === member.id && Date.now() - entry.createdTimestamp < 5000) {
                kickedBy = entry.executor;
            }
        } catch { /* no audit log perms */ }

        const embed = new EmbedBuilder()
            .setColor(kickedBy ? 'Orange' : 'Grey')
            .setTitle(kickedBy ? '👢 Miembro expulsado (kick)' : '📤 Miembro salió del servidor')
            .setThumbnail(member.user.displayAvatarURL())
            .addFields(
                { name: '👤 Usuario', value: `${member.user.username} (${member.id})`, inline: true },
                { name: '📅 Se unió', value: member.joinedAt
                    ? `<t:${Math.floor(member.joinedAt.getTime() / 1000)}:R>`
                    : 'Desconocido', inline: true },
                { name: '👥 Miembros ahora', value: `${member.guild.memberCount}`, inline: true },
            )
            .setFooter({ text: `ID: ${member.id}` })
            .setTimestamp();

        if (kickedBy) {
            embed.addFields({ name: '🔨 Expulsado por', value: `${kickedBy.username} (${kickedBy.id})`, inline: false });
        }

        await guildLog(client, member.guild.id, embed);
    },
};
