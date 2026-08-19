const {
    SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder,
    ActionRowBuilder, ButtonBuilder, ButtonStyle,
} = require('discord.js');
const UserLevel = require('../../../models/UserLevel');

module.exports = {
    name: 'restartlevel',
    description: 'Reinicia todos los niveles y XP del servidor (requiere confirmación).',
    category: 'utility',
    permissions: [PermissionFlagsBits.Administrator],
    data: new SlashCommandBuilder()
        .setName('restartlevel')
        .setDescription('Reinicia todos los niveles y XP del servidor (requiere confirmación).')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(ctx) {
        const count = await UserLevel.countDocuments({ guildId: ctx.guild.id });

        if (count === 0) {
            return ctx.reply({ content: '⚠️ No hay datos de nivelación en este servidor.', ephemeral: true });
        }

        if (!ctx.isSlash) {
            // Prefix fallback — direct reset without buttons
            await UserLevel.deleteMany({ guildId: ctx.guild.id });
            return ctx.reply(`🗑️ Se reiniciaron los datos de nivelación de **${count}** usuario(s).`);
        }

        const embed = new EmbedBuilder()
            .setColor('Orange')
            .setTitle('⚠️ Confirmar reinicio de nivelación')
            .setDescription(
                `Esto eliminará el XP, nivel y contador de mensajes de **${count}** usuario(s) en **${ctx.guild.name}**.\n\n**Esta acción no se puede deshacer.**`
            )
            .setFooter({ text: `Solicitado por ${ctx.user.username}` });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('restartlevel_confirm')
                .setLabel('🗑️ Sí, reiniciar todo')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId('restartlevel_cancel')
                .setLabel('❌ Cancelar')
                .setStyle(ButtonStyle.Secondary),
        );

        const msg = await ctx.interaction.reply({
            embeds: [embed], components: [row], ephemeral: true, fetchReply: true,
        });

        const collector = msg.createMessageComponentCollector({
            filter: (i) => i.user.id === ctx.user.id,
            max: 1,
            time: 30_000,
        });

        collector.on('collect', async (i) => {
            if (i.customId === 'restartlevel_cancel') {
                return i.update({
                    embeds: [embed.setTitle('❌ Reinicio cancelado').setColor('Grey')],
                    components: [],
                });
            }
            await UserLevel.deleteMany({ guildId: ctx.guild.id });
            await i.update({
                embeds: [new EmbedBuilder()
                    .setColor('Green')
                    .setTitle('✅ Nivelación reiniciada')
                    .setDescription(`Se eliminaron los datos de **${count}** usuario(s). Todos parten desde nivel 0.`)
                    .setTimestamp()],
                components: [],
            });
        });

        collector.on('end', (_, reason) => {
            if (reason === 'time') {
                msg.edit({ embeds: [embed.setFooter({ text: 'Confirmación expirada.' })], components: [] }).catch(() => {});
            }
        });
    },
};
