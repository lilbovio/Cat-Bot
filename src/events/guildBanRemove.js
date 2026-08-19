const { Events, EmbedBuilder, AuditLogEvent } = require('discord.js');
const { guildLog } = require('../utils/guildLog');

module.exports = {
    name: Events.GuildBanRemove,
    async execute(client, ban) {
        let executor = null;
        try {
            await new Promise((r) => setTimeout(r, 500));
            const audit = await ban.guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanRemove, limit: 1 });
            const entry = audit.entries.first();
            if (entry && entry.target?.id === ban.user.id && Date.now() - entry.createdTimestamp < 5000) {
                executor = entry.executor;
            }
        } catch { /* no perms */ }

        const embed = new EmbedBuilder()
            .setColor('Green')
            .setTitle('✅ Usuario desbaneado')
            .setThumbnail(ban.user.displayAvatarURL())
            .addFields(
                { name: '👤 Usuario',    value: `${ban.user.username} (${ban.user.id})`, inline: true },
                { name: '🔓 Por',        value: executor ? `${executor.username}` : 'Desconocido', inline: true },
            )
            .setFooter({ text: `ID: ${ban.user.id}` })
            .setTimestamp();

        await guildLog(client, ban.guild.id, embed);
    },
};
