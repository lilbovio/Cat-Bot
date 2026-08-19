const { Events, EmbedBuilder } = require('discord.js');
const GuildConfig = require('../../models/GuildConfig');
const { guildLog } = require('../utils/guildLog');
const logger = require('../utils/logger');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(client, member) {
        const { guild } = member;
        try {
            const guildConfig = await GuildConfig.findOne({ guildId: guild.id });

            // ── Auto-rol ──────────────────────────────────────────────────────
            if (guildConfig?.autoRole) {
                const role = guild.roles.cache.get(guildConfig.autoRole);
                if (role) await member.roles.add(role).catch(() => {});
            }

            // ── Mensaje de bienvenida ─────────────────────────────────────────
            if (guildConfig?.welcomeChannel && guildConfig?.welcomeMessage) {
                const ch = guild.channels.cache.get(guildConfig.welcomeChannel);
                if (ch?.isTextBased()) {
                    const text = guildConfig.welcomeMessage.replace('{usuario}', `<@${member.id}>`);
                    const opts = { content: text };
                    if (guildConfig.welcomeImage) opts.files = [guildConfig.welcomeImage];
                    await ch.send(opts);
                }
            }

            // ── Log de moderación ─────────────────────────────────────────────
            const embed = new EmbedBuilder()
                .setColor('Green')
                .setTitle('📥 Miembro entró al servidor')
                .setThumbnail(member.user.displayAvatarURL())
                .addFields(
                    { name: '👤 Usuario',    value: `${member.user.username} (${member.id})`, inline: true },
                    { name: '📅 Cuenta creada', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true },
                    { name: '👥 Miembros ahora', value: `${guild.memberCount}`, inline: true },
                )
                .setFooter({ text: `ID: ${member.id}` })
                .setTimestamp();

            await guildLog(client, guild.id, embed);
        } catch (error) {
            logger.error(`Error en guildMemberAdd (${guild.id}):`, error);
        }
    },
};
