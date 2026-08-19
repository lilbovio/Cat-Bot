const { Events, EmbedBuilder, AuditLogEvent } = require('discord.js');
const { guildLog } = require('../utils/guildLog');

const CHANNEL_TYPE_NAMES = {
    0: 'Texto', 2: 'Voz', 4: 'Categoría', 5: 'Anuncios',
    10: 'Hilo de anuncios', 11: 'Hilo público', 12: 'Hilo privado',
    13: 'Escenario', 15: 'Foro',
};

module.exports = {
    name: Events.ChannelCreate,
    async execute(client, channel) {
        if (!channel.guild) return;

        let creator = null;
        try {
            await new Promise((r) => setTimeout(r, 500));
            const audit = await channel.guild.fetchAuditLogs({ type: AuditLogEvent.ChannelCreate, limit: 1 });
            const entry = audit.entries.first();
            if (entry && entry.target?.id === channel.id && Date.now() - entry.createdTimestamp < 5000) {
                creator = entry.executor;
            }
        } catch { /* no perms */ }

        const embed = new EmbedBuilder()
            .setColor('Green')
            .setTitle('📢 Canal creado')
            .addFields(
                { name: '📺 Canal',    value: `${channel} (#${channel.name})`, inline: true },
                { name: '🗂️ Tipo',    value: CHANNEL_TYPE_NAMES[channel.type] ?? `${channel.type}`, inline: true },
                { name: '🔧 Creado por', value: creator ? `${creator.username}` : 'Desconocido', inline: true },
            )
            .setFooter({ text: `ID: ${channel.id}` })
            .setTimestamp();

        await guildLog(client, channel.guild.id, embed);
    },
};
