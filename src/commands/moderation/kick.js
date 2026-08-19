const {
    SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder,
    ActionRowBuilder, ButtonBuilder, ButtonStyle,
} = require('discord.js');

module.exports = {
    name: 'kick',
    description: 'Expulsa a un usuario del servidor (pide confirmación).',
    category: 'moderation',
    cooldown: 5,
    permissions: [PermissionFlagsBits.KickMembers],
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Expulsa a un usuario del servidor (pide confirmación).')
        .addUserOption((o) =>
            o.setName('usuario').setDescription('El usuario que deseas expulsar.').setRequired(true)
        )
        .addStringOption((o) =>
            o.setName('razon').setDescription('Razón de la expulsión.').setRequired(false)
        ),
    async execute(ctx) {
        const member = await ctx.getMember('usuario');
        const razon  = ctx.getString('razon') || 'No se proporcionó una razón.';

        if (!member) return ctx.reply({ content: '❌ Por favor menciona a un usuario válido para expulsar.', ephemeral: true });
        if (!member.kickable) return ctx.reply({ content: '❌ No puedo expulsar a ese usuario.', ephemeral: true });
        if (member.id === ctx.user.id) return ctx.reply({ content: '❌ No puedes expulsarte a ti mismo.', ephemeral: true });

        if (!ctx.isSlash) {
            await member.kick(razon);
            return ctx.reply(`✅ **${member.user.username}** ha sido expulsado.\n**Razón:** ${razon}`);
        }

        const embed = new EmbedBuilder()
            .setTitle('👢 Confirmar Kick')
            .setColor('Orange')
            .setThumbnail(member.user.displayAvatarURL())
            .addFields(
                { name: 'Usuario', value: `${member.user.username} (${member.id})`, inline: true },
                { name: 'Razón',   value: razon,                               inline: false },
            )
            .setFooter({ text: 'El usuario podrá volver al servidor.' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('kick_confirm').setLabel('✅ Confirmar').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('kick_cancel') .setLabel('❌ Cancelar') .setStyle(ButtonStyle.Secondary),
        );

        const msg = await ctx.interaction.reply({ embeds: [embed], components: [row], ephemeral: true, fetchReply: true });

        const collector = msg.createMessageComponentCollector({
            filter: (i) => i.user.id === ctx.user.id,
            max: 1, time: 30000,
        });

        collector.on('collect', async (i) => {
            if (i.customId === 'kick_cancel') {
                return i.update({ embeds: [embed.setTitle('❌ Kick cancelado').setColor('Grey')], components: [] });
            }
            try {
                await member.kick(razon);
                await i.update({
                    embeds: [new EmbedBuilder()
                        .setTitle('✅ Kick ejecutado')
                        .setColor('Green')
                        .setDescription(`**${member.user.username}** ha sido expulsado.\n**Razón:** ${razon}`)],
                    components: [],
                });
            } catch {
                await i.update({ content: '❌ Error al expulsar al usuario.', embeds: [], components: [] });
            }
        });

        collector.on('end', (_, reason) => {
            if (reason === 'time') msg.edit({ embeds: [embed.setFooter({ text: 'Confirmación expirada.' })], components: [] }).catch(() => {});
        });
    },
};
