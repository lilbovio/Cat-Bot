const {
    SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder,
    ActionRowBuilder, ButtonBuilder, ButtonStyle,
} = require('discord.js');
const { parseDuration, formatDuration } = require('../../utils/format');

module.exports = {
    name: 'timeout',
    description: 'Aplica un timeout nativo de Discord a un usuario.',
    category: 'moderation',
    cooldown: 5,
    permissions: [PermissionFlagsBits.ModerateMembers],
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Aplica un timeout nativo de Discord a un usuario.')
        .addUserOption((o) => o.setName('usuario').setDescription('Usuario a silenciar.').setRequired(true))
        .addStringOption((o) =>
            o.setName('duracion').setDescription('Duración del timeout (ej: 10s, 5m, 1h). Máx: 28d.').setRequired(true)
        )
        .addStringOption((o) => o.setName('razon').setDescription('Razón del timeout.').setRequired(false)),
    async execute(ctx) {
        const member = await ctx.getMember('usuario');
        const raw    = ctx.getString('duracion');
        const razon  = ctx.getString('razon') || 'No especificada';

        if (!member) return ctx.reply({ content: '❌ No se encontró al usuario en el servidor.', ephemeral: true });
        if (!member.moderatable) return ctx.reply({ content: '❌ No puedo aplicar timeout a ese usuario.', ephemeral: true });

        const ms = parseDuration(raw);
        if (!ms) return ctx.reply({ content: '❌ Duración inválida. Usa: `10s`, `5m`, `1h`, `1d`.', ephemeral: true });
        const MAX_MS = 28 * 24 * 60 * 60 * 1000;
        if (ms > MAX_MS) return ctx.reply({ content: '❌ El timeout máximo de Discord es 28 días.', ephemeral: true });

        if (!ctx.isSlash) {
            await member.timeout(ms, razon);
            return ctx.reply(`⏱️ **${member.user.username}** ha recibido timeout por **${formatDuration(ms)}**.\n**Razón:** ${razon}`);
        }

        const embed = new EmbedBuilder()
            .setTitle('⏱️ Confirmar Timeout')
            .setColor('Yellow')
            .setThumbnail(member.user.displayAvatarURL())
            .addFields(
                { name: 'Usuario',   value: `${member.user.username} (${member.id})`, inline: true },
                { name: 'Duración',  value: formatDuration(ms),                  inline: true },
                { name: 'Razón',     value: razon,                               inline: false },
            );

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('timeout_confirm').setLabel('⏱️ Aplicar').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('timeout_cancel') .setLabel('❌ Cancelar').setStyle(ButtonStyle.Secondary),
        );

        const msg = await ctx.interaction.reply({ embeds: [embed], components: [row], ephemeral: true, fetchReply: true });

        const collector = msg.createMessageComponentCollector({
            filter: (i) => i.user.id === ctx.user.id,
            max: 1, time: 30000,
        });

        collector.on('collect', async (i) => {
            if (i.customId === 'timeout_cancel') {
                return i.update({ embeds: [embed.setTitle('❌ Timeout cancelado').setColor('Grey')], components: [] });
            }
            try {
                await member.timeout(ms, razon);
                await i.update({
                    embeds: [new EmbedBuilder()
                        .setTitle('✅ Timeout aplicado')
                        .setColor('Green')
                        .setDescription(`⏱️ **${member.user.username}** silenciado por **${formatDuration(ms)}**.\n**Razón:** ${razon}`)],
                    components: [],
                });
            } catch {
                await i.update({ content: '❌ Error al aplicar el timeout.', embeds: [], components: [] });
            }
        });

        collector.on('end', (_, reason) => {
            if (reason === 'time') msg.edit({ embeds: [embed.setFooter({ text: 'Confirmación expirada.' })], components: [] }).catch(() => {});
        });
    },
};
