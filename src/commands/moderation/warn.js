const {
    SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder,
    ActionRowBuilder, ButtonBuilder, ButtonStyle,
} = require('discord.js');
const Warn = require('../../../models/WarnSchema');

module.exports = {
    name: 'warn',
    description: 'Advierte a un usuario y registra el warn (con confirmación).',
    category: 'moderation',
    cooldown: 5,
    permissions: [PermissionFlagsBits.ModerateMembers],
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Advierte a un usuario y registra el warn.')
        .addUserOption((o) => o.setName('usuario').setDescription('El usuario a advertir.').setRequired(true))
        .addStringOption((o) => o.setName('razon').setDescription('Razón del warn.').setRequired(true)),

    async execute(ctx) {
        const target = await ctx.getUser('usuario');
        const razon  = ctx.getString('razon');
        if (!target || !razon) return ctx.reply({ content: '❌ Especifica usuario y razón.', ephemeral: true });
        if (target.bot) return ctx.reply({ content: '❌ No puedes advertir a un bot.', ephemeral: true });

        if (!ctx.isSlash) {
            let data = await Warn.findOne({ guildId: ctx.guild.id, userId: target.id });
            if (!data) data = new Warn({ guildId: ctx.guild.id, userId: target.id, warns: [] });
            data.warns.push({ reason: razon, moderatorId: ctx.user.id });
            await data.save();
            return ctx.reply(`⚠️ **${target.username}** advertido. Total warns: **${data.warns.length}**.`);
        }

        const previewEmbed = new EmbedBuilder()
            .setTitle('⚠️ Confirmar Warn')
            .setColor('Yellow')
            .setThumbnail(target.displayAvatarURL())
            .addFields(
                { name: 'Usuario', value: `${target.username} (${target.id})`, inline: true },
                { name: 'Razón',   value: razon,                          inline: false },
            );

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('warn_confirm').setLabel('⚠️ Confirmar warn').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('warn_cancel') .setLabel('❌ Cancelar').setStyle(ButtonStyle.Secondary),
        );

        const msg = await ctx.interaction.reply({ embeds: [previewEmbed], components: [row], ephemeral: true, fetchReply: true });

        const collector = msg.createMessageComponentCollector({
            filter: (i) => i.user.id === ctx.user.id,
            max: 1, time: 30000,
        });

        collector.on('collect', async (i) => {
            if (i.customId === 'warn_cancel') {
                return i.update({ embeds: [previewEmbed.setTitle('❌ Warn cancelado').setColor('Grey')], components: [] });
            }

            let data = await Warn.findOne({ guildId: ctx.guild.id, userId: target.id });
            if (!data) data = new Warn({ guildId: ctx.guild.id, userId: target.id, warns: [] });
            data.warns.push({ reason: razon, moderatorId: ctx.user.id });
            await data.save();

            const total = data.warns.length;
            const color = total >= 5 ? 'Red' : total >= 3 ? 'Orange' : 'Yellow';

            await i.update({
                embeds: [new EmbedBuilder()
                    .setTitle('✅ Warn registrado')
                    .setColor(color)
                    .addFields(
                        { name: 'Usuario',        value: `${target.username}`, inline: true },
                        { name: 'Total de warns', value: `**${total}**`,  inline: true },
                        { name: 'Razón',          value: razon,           inline: false },
                    )
                    .setFooter(total >= 3 ? { text: '⚠️ Este usuario acumula muchos warns.' } : null)],
                components: [],
            });

            // Try to DM the warned user
            target.send(`⚠️ Has recibido un warn en **${ctx.guild.name}**.\n**Razón:** ${razon}\n**Warns totales:** ${total}`).catch(() => {});
        });

        collector.on('end', (col, reason) => {
            if (reason === 'time') msg.edit({ components: [] }).catch(() => {});
        });
    },
};
