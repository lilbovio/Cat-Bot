const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Blacklist = require('../../../models/Blacklist');
const config = require('../../../config');
const logger = require('../../utils/logger');

module.exports = {
    name: 'blacklist',
    description: 'Gestiona la blacklist global del bot (solo el creador).',
    category: 'config',
    ownerOnly: true,
    data: new SlashCommandBuilder()
        .setName('blacklist')
        .setDescription('Gestiona la blacklist global del bot (solo el creador).')
        // ── add ────────────────────────────────────────────────────────────────
        .addSubcommand((sub) =>
            sub.setName('add')
                .setDescription('Añade a un usuario a la blacklist.')
                .addStringOption((o) =>
                    o.setName('id')
                        .setDescription('ID del usuario a bloquear.')
                        .setRequired(true)
                )
                .addStringOption((o) =>
                    o.setName('razon')
                        .setDescription('Razón del bloqueo.')
                        .setRequired(false)
                )
        )
        // ── remove ─────────────────────────────────────────────────────────────
        .addSubcommand((sub) =>
            sub.setName('remove')
                .setDescription('Elimina a un usuario de la blacklist.')
                .addStringOption((o) =>
                    o.setName('id')
                        .setDescription('ID del usuario a desbloquear.')
                        .setRequired(true)
                )
        )
        // ── list ───────────────────────────────────────────────────────────────
        .addSubcommand((sub) =>
            sub.setName('list')
                .setDescription('Lista todos los usuarios en la blacklist.')
        )
        // ── check ──────────────────────────────────────────────────────────────
        .addSubcommand((sub) =>
            sub.setName('check')
                .setDescription('Comprueba si un usuario está en la blacklist.')
                .addStringOption((o) =>
                    o.setName('id')
                        .setDescription('ID del usuario a comprobar.')
                        .setRequired(true)
                )
        ),

    async execute(ctx) {
        const sub = ctx.getSubcommand();

        // ── add ─────────────────────────────────────────────────────────────────
        if (sub === 'add') {
            const userId = ctx.getString('id')?.trim();
            const razon  = ctx.getString('razon') || 'Sin razón';

            if (!userId || !/^\d{15,20}$/.test(userId)) {
                return ctx.reply({ content: '❌ ID de usuario inválida (debe tener entre 15 y 20 dígitos).', ephemeral: true });
            }
            if (userId === config.adminID) {
                return ctx.reply({ content: '❌ No puedes añadirte a ti mismo a la blacklist.', ephemeral: true });
            }

            const existing = await Blacklist.findOne({ userID: userId });
            if (existing) {
                return ctx.reply({ content: `⚠️ El usuario \`${userId}\` ya está en la blacklist.`, ephemeral: true });
            }

            await Blacklist.create({ userID: userId });
            logger.info(`[Blacklist] Añadido: ${userId} — Razón: ${razon} — Por: ${ctx.user.id}`);

            // Log in the bot's blacklist log channel
            try {
                const ch = await ctx.client.channels.fetch(config.channels.blacklistLog).catch(() => null);
                if (ch?.isTextBased()) {
                    await ch.send(
                        `🚫 **Blacklist añadida** · ID: \`${userId}\`\n**Razón:** ${razon}\n**Moderador:** <@${ctx.user.id}>`
                    );
                }
            } catch { /* non-critical */ }

            const embed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('🚫 Usuario añadido a la blacklist')
                .addFields(
                    { name: '🆔 ID',     value: `\`${userId}\``, inline: true },
                    { name: '📝 Razón',  value: razon,           inline: true },
                )
                .setFooter({ text: `Añadido por ${ctx.user.username}` })
                .setTimestamp();

            return ctx.reply({ embeds: [embed] });
        }

        // ── remove ──────────────────────────────────────────────────────────────
        if (sub === 'remove') {
            const userId = ctx.getString('id')?.trim();
            if (!userId || !/^\d{15,20}$/.test(userId)) {
                return ctx.reply({ content: '❌ ID de usuario inválida.', ephemeral: true });
            }

            const result = await Blacklist.findOneAndDelete({ userID: userId });
            if (!result) {
                return ctx.reply({ content: `⚠️ El usuario \`${userId}\` no está en la blacklist.`, ephemeral: true });
            }

            logger.info(`[Blacklist] Eliminado: ${userId} — Por: ${ctx.user.id}`);

            const embed = new EmbedBuilder()
                .setColor('Green')
                .setTitle('✅ Usuario eliminado de la blacklist')
                .setDescription(`El usuario \`${userId}\` ya puede usar el bot.`)
                .setTimestamp();

            return ctx.reply({ embeds: [embed] });
        }

        // ── list ────────────────────────────────────────────────────────────────
        if (sub === 'list') {
            const list = await Blacklist.find().sort({ _id: -1 }).limit(50);
            if (!list.length) {
                return ctx.reply({ content: '✅ La blacklist está vacía.', ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setColor('Orange')
                .setTitle(`🚫 Blacklist global — ${list.length} usuario(s)`)
                .setDescription(list.map((b) => `• \`${b.userID}\``).join('\n').slice(0, 4096))
                .setFooter({ text: 'Máximo 50 mostrados · Usa el dashboard para ver todos' })
                .setTimestamp();

            return ctx.reply({ embeds: [embed], ephemeral: true });
        }

        // ── check ───────────────────────────────────────────────────────────────
        if (sub === 'check') {
            const userId = ctx.getString('id')?.trim();
            if (!userId || !/^\d{15,20}$/.test(userId)) {
                return ctx.reply({ content: '❌ ID de usuario inválida.', ephemeral: true });
            }

            const entry = await Blacklist.findOne({ userID: userId });
            const embed = new EmbedBuilder()
                .setTitle('🔍 Comprobación de blacklist')
                .addFields({ name: '🆔 ID', value: `\`${userId}\``, inline: true })
                .setTimestamp();

            if (entry) {
                embed.setColor('Red').addFields({ name: '🚫 Estado', value: 'En la blacklist', inline: true });
            } else {
                embed.setColor('Green').addFields({ name: '✅ Estado', value: 'No está en la blacklist', inline: true });
            }

            return ctx.reply({ embeds: [embed], ephemeral: true });
        }
    },
};
