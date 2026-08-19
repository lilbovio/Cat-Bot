const { Events, EmbedBuilder, AuditLogEvent } = require('discord.js');
const { guildLog } = require('../utils/guildLog');

module.exports = {
    name: Events.GuildMemberUpdate,
    async execute(client, oldMember, newMember) {
        const embeds = [];

        // ── Nickname changed ──────────────────────────────────────────────────
        if (oldMember.nickname !== newMember.nickname) {
            embeds.push(
                new EmbedBuilder()
                    .setColor('Blue')
                    .setTitle('✏️ Apodo modificado')
                    .setThumbnail(newMember.user.displayAvatarURL())
                    .addFields(
                        { name: '👤 Usuario',    value: `${newMember.user.username} (${newMember.id})`, inline: false },
                        { name: '📝 Antes',      value: oldMember.nickname || '*sin apodo*',       inline: true  },
                        { name: '📝 Ahora',      value: newMember.nickname || '*sin apodo*',       inline: true  },
                    )
                    .setFooter({ text: `ID: ${newMember.id}` })
                    .setTimestamp()
            );
        }

        // ── Roles added ───────────────────────────────────────────────────────
        const addedRoles   = newMember.roles.cache.filter((r) => !oldMember.roles.cache.has(r.id));
        const removedRoles = oldMember.roles.cache.filter((r) => !newMember.roles.cache.has(r.id));

        if (addedRoles.size > 0) {
            embeds.push(
                new EmbedBuilder()
                    .setColor('Green')
                    .setTitle('🟢 Roles añadidos')
                    .addFields(
                        { name: '👤 Usuario', value: `${newMember.user.username} (${newMember.id})`, inline: false },
                        { name: '➕ Roles',   value: addedRoles.map((r) => `<@&${r.id}>`).join(' '), inline: false },
                    )
                    .setFooter({ text: `ID: ${newMember.id}` })
                    .setTimestamp()
            );
        }

        if (removedRoles.size > 0) {
            embeds.push(
                new EmbedBuilder()
                    .setColor('Red')
                    .setTitle('🔴 Roles removidos')
                    .addFields(
                        { name: '👤 Usuario', value: `${newMember.user.username} (${newMember.id})`, inline: false },
                        { name: '➖ Roles',   value: removedRoles.map((r) => `<@&${r.id}>`).join(' '), inline: false },
                    )
                    .setFooter({ text: `ID: ${newMember.id}` })
                    .setTimestamp()
            );
        }

        // ── Timeout applied or removed ────────────────────────────────────────
        const hadTimeout  = oldMember.communicationDisabledUntil && oldMember.communicationDisabledUntil > new Date();
        const hasTimeout  = newMember.communicationDisabledUntil && newMember.communicationDisabledUntil > new Date();

        if (!hadTimeout && hasTimeout) {
            let executor = null;
            try {
                await new Promise((r) => setTimeout(r, 500));
                const audit = await newMember.guild.fetchAuditLogs({ type: AuditLogEvent.MemberUpdate, limit: 1 });
                const entry = audit.entries.first();
                if (entry && entry.target?.id === newMember.id && Date.now() - entry.createdTimestamp < 5000) {
                    executor = entry.executor;
                }
            } catch { /* no perms */ }

            embeds.push(
                new EmbedBuilder()
                    .setColor('Yellow')
                    .setTitle('⏱️ Timeout aplicado')
                    .addFields(
                        { name: '👤 Usuario',   value: `${newMember.user.username} (${newMember.id})`, inline: true },
                        { name: '⏰ Expira',    value: `<t:${Math.floor(newMember.communicationDisabledUntil.getTime() / 1000)}:R>`, inline: true },
                        { name: '🔨 Por',       value: executor ? `${executor.username}` : 'Desconocido', inline: true },
                    )
                    .setFooter({ text: `ID: ${newMember.id}` })
                    .setTimestamp()
            );
        } else if (hadTimeout && !hasTimeout) {
            embeds.push(
                new EmbedBuilder()
                    .setColor('Green')
                    .setTitle('✅ Timeout eliminado')
                    .addFields(
                        { name: '👤 Usuario', value: `${newMember.user.username} (${newMember.id})`, inline: false },
                    )
                    .setFooter({ text: `ID: ${newMember.id}` })
                    .setTimestamp()
            );
        }

        for (const embed of embeds) {
            await guildLog(client, newMember.guild.id, embed);
        }
    },
};
