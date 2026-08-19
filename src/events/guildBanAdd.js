const { Events, EmbedBuilder, AuditLogEvent } = require('discord.js');
const { guildLog } = require('../utils/guildLog');

module.exports = {
    name: Events.GuildBanAdd,
    async execute(client, ban) {
        let executor = null;
        let reason    = ban.reason || 'No especificada';
        try {
            await new Promise((r) => setTimeout(r, 500));
            const audit = await ban.guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanAdd, limit: 1 });
            const entry = audit.entries.first();
            if (entry && entry.target?.id === ban.user.id && Date.now() - entry.createdTimestamp < 5000) {
                executor = entry.executor;
                reason   = entry.reason || reason;
            }
        } catch { /* no perms */ }

        const embed = new EmbedBuilder()
            .setColor('DarkRed')
            .setTitle('🔨 Usuario baneado')
            .setThumbnail(ban.user.displayAvatarURL())
            .addFields(
                { name: '👤 Usuario',   value: `${ban.user.username} (${ban.user.id})`, inline: true },
                { name: '🔨 Por',       value: executor ? `${executor.username}` : 'Desconocido', inline: true },
                { name: '📝 Razón',     value: reason, inline: false },
            )
            .setFooter({ text: `ID: ${ban.user.id}` })
            .setTimestamp();

        await guildLog(client, ban.guild.id, embed);
    },
};
