const {
    SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder,
    ActionRowBuilder, ButtonBuilder, ButtonStyle,
} = require('discord.js');
const { parseDuration, formatDuration } = require('../../utils/format');

module.exports = {
    name: 'mute',
    description: 'Silencia a un usuario temporalmente (rol "Muted").',
    category: 'moderation',
    cooldown: 5,
    permissions: [PermissionFlagsBits.ManageRoles],
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Silencia a un usuario temporalmente (rol "Muted").')
        .addUserOption((o) =>
            o.setName('usuario').setDescription('Usuario a silenciar.').setRequired(true)
        )
        .addStringOption((o) =>
            o.setName('duracion')
                .setDescription('Duración del silencio (ej: 10s, 5m, 1h). Por defecto: 5m.')
                .setRequired(false)
        ),
    async execute(ctx) {
        const muteRole = ctx.guild.roles.cache.find((r) => r.name === 'Muted');
        if (!muteRole) return ctx.reply({ content: '❌ El rol "Muted" no existe en este servidor.', ephemeral: true });

        const member = await ctx.getMember('usuario');
        if (!member) return ctx.reply({ content: '❌ No se encontró al usuario.', ephemeral: true });
        if (member.roles.cache.has(muteRole.id)) return ctx.reply({ content: '❌ Ese usuario ya está silenciado.', ephemeral: true });

        const rawDuration = ctx.getString('duracion') || '5m';
        const muteMs = parseDuration(rawDuration);
        if (!muteMs) return ctx.reply({ content: '❌ Formato de duración inválido. Usa: 10s, 5m, 1h.', ephemeral: true });

        const applyMute = async () => {
            await member.roles.add(muteRole);
            setTimeout(async () => {
                const fresh = await ctx.guild.members.fetch(member.id).catch(() => null);
                if (fresh?.roles.cache.has(muteRole.id)) {
                    await fresh.roles.remove(muteRole).catch(() => {});
                    ctx.send(`🔊 ${fresh} ha sido desilenciado automáticamente.`);
                }
            }, muteMs);
        };

        if (!ctx.isSlash) {
            await applyMute();
            return ctx.reply(`🔇 **${member.user.username}** ha sido silenciado por **${formatDuration(muteMs)}**.`);
        }

        const embed = new EmbedBuilder()
            .setTitle('🔇 Confirmar Mute')
            .setColor('Yellow')
            .setThumbnail(member.user.displayAvatarURL())
            .addFields(
                { name: 'Usuario',   value: `${member.user.username} (${member.id})`, inline: true },
                { name: 'Duración',  value: formatDuration(muteMs),              inline: true },
            );

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('mute_confirm').setLabel('🔇 Silenciar').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('mute_cancel') .setLabel('❌ Cancelar') .setStyle(ButtonStyle.Secondary),
        );

        const msg = await ctx.interaction.reply({ embeds: [embed], components: [row], ephemeral: true, fetchReply: true });

        const collector = msg.createMessageComponentCollector({
            filter: (i) => i.user.id === ctx.user.id,
            max: 1, time: 30000,
        });

        collector.on('collect', async (i) => {
            if (i.customId === 'mute_cancel') {
                return i.update({ embeds: [embed.setTitle('❌ Mute cancelado').setColor('Grey')], components: [] });
            }
            try {
                await applyMute();
                await i.update({
                    embeds: [new EmbedBuilder()
                        .setTitle('✅ Mute aplicado')
                        .setColor('Green')
                        .setDescription(`🔇 **${member.user.username}** silenciado por **${formatDuration(muteMs)}**.`)],
                    components: [],
                });
            } catch {
                await i.update({ content: '❌ Error al silenciar al usuario.', embeds: [], components: [] });
            }
        });

        collector.on('end', (_, reason) => {
            if (reason === 'time') msg.edit({ embeds: [embed.setFooter({ text: 'Confirmación expirada.' })], components: [] }).catch(() => {});
        });
    },
};
