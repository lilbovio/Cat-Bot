const {
    SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder,
    ActionRowBuilder, ButtonBuilder, ButtonStyle,
} = require('discord.js');
const Warn = require('../../../models/WarnSchema');

module.exports = {
    name: 'clearwarns',
    description: 'Borra todos los warns de un usuario.',
    category: 'moderation',
    cooldown: 3,
    permissions: [PermissionFlagsBits.ModerateMembers],
    data: new SlashCommandBuilder()
        .setName('clearwarns')
        .setDescription('Borra todos los warns de un usuario.')
        .addUserOption((o) => o.setName('usuario').setDescription('Usuario al que limpiar los warns.').setRequired(true)),
    async execute(ctx) {
        const target = await ctx.getUser('usuario');
        if (!target) return ctx.reply({ content: '❌ Usuario no encontrado.', ephemeral: true });

        const existing = await Warn.findOne({ guildId: ctx.guild.id, userId: target.id });
        if (!existing || existing.warns.length === 0) {
            return ctx.reply({ content: `✅ **${target.username}** no tiene warns.`, ephemeral: true });
        }

        const count = existing.warns.length;

        if (!ctx.isSlash) {
            await Warn.findOneAndDelete({ guildId: ctx.guild.id, userId: target.id });
            return ctx.reply(`🗑️ Se eliminaron **${count}** warn(s) de **${target.username}**.`);
        }

        const embed = new EmbedBuilder()
            .setTitle('🗑️ Confirmar limpieza de warns')
            .setColor('Orange')
            .setThumbnail(target.displayAvatarURL())
            .setDescription(`¿Estás seguro de que quieres eliminar todos los warns de **${target.username}**?`)
            .addFields({ name: 'Warns a eliminar', value: `${count}`, inline: true });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('clearwarns_confirm').setLabel('🗑️ Eliminar todos').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('clearwarns_cancel') .setLabel('❌ Cancelar')     .setStyle(ButtonStyle.Secondary),
        );

        const msg = await ctx.interaction.reply({ embeds: [embed], components: [row], ephemeral: true, fetchReply: true });

        const collector = msg.createMessageComponentCollector({
            filter: (i) => i.user.id === ctx.user.id,
            max: 1, time: 30000,
        });

        collector.on('collect', async (i) => {
            if (i.customId === 'clearwarns_cancel') {
                return i.update({ embeds: [embed.setTitle('❌ Cancelado').setColor('Grey')], components: [] });
            }
            await Warn.findOneAndDelete({ guildId: ctx.guild.id, userId: target.id });
            await i.update({
                embeds: [new EmbedBuilder()
                    .setTitle('✅ Warns eliminados')
                    .setColor('Green')
                    .setDescription(`Se eliminaron **${count}** warn(s) de **${target.username}**.`)],
                components: [],
            });
        });

        collector.on('end', (_, reason) => {
            if (reason === 'time') msg.edit({ embeds: [embed.setFooter({ text: 'Confirmación expirada.' })], components: [] }).catch(() => {});
        });
    },
};
