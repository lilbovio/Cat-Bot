const {
    SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder,
    ActionRowBuilder, ButtonBuilder, ButtonStyle,
} = require('discord.js');

module.exports = {
    name: 'ban',
    description: 'Banea a un usuario del servidor (pide confirmación).',
    category: 'moderation',
    cooldown: 5,
    permissions: [PermissionFlagsBits.BanMembers],
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Banea a un usuario del servidor (pide confirmación).')
        .addUserOption((o) => o.setName('usuario').setDescription('El usuario que deseas banear.').setRequired(true))
        .addStringOption((o) => o.setName('razon').setDescription('Razón del baneo.').setRequired(false)),

    async execute(ctx) {
        const member = await ctx.getMember('usuario');
        const razon  = ctx.getString('razon') || 'No se proporcionó una razón.';

        if (!member) return ctx.reply({ content: '❌ No se encontró ese usuario en el servidor.', ephemeral: true });
        if (!member.bannable) return ctx.reply({ content: '❌ No puedo banear a ese usuario.', ephemeral: true });
        if (member.id === ctx.user.id) return ctx.reply({ content: '❌ No puedes banearte a ti mismo.', ephemeral: true });

        if (!ctx.isSlash) {
            // prefix: just do it directly (no way to show buttons without fetchReply)
            await member.ban({ reason: razon });
            return ctx.reply(`✅ **${member.user.username}** ha sido baneado.\n**Razón:** ${razon}`);
        }

        const embed = new EmbedBuilder()
            .setTitle('⛔ Confirmar Ban')
            .setColor('Red')
            .setThumbnail(member.user.displayAvatarURL())
            .addFields(
                { name: 'Usuario',  value: `${member.user.username} (${member.id})`, inline: true },
                { name: 'Razón',    value: razon,                               inline: false },
            )
            .setFooter({ text: 'Esta acción no se puede deshacer fácilmente.' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('ban_confirm').setLabel('✅ Confirmar ban').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('ban_cancel') .setLabel('❌ Cancelar').setStyle(ButtonStyle.Secondary),
        );

        const msg = await ctx.interaction.reply({ embeds: [embed], components: [row], ephemeral: true, fetchReply: true });

        const collector = msg.createMessageComponentCollector({
            filter: (i) => i.user.id === ctx.user.id,
            max: 1, time: 30000,
        });

        collector.on('collect', async (i) => {
            if (i.customId === 'ban_cancel') {
                await i.update({ embeds: [embed.setTitle('❌ Ban cancelado').setColor('Grey')], components: [] });
                return;
            }
            try {
                await member.ban({ reason: razon });
                await i.update({
                    embeds: [new EmbedBuilder()
                        .setTitle('✅ Ban ejecutado')
                        .setColor('Green')
                        .setDescription(`**${member.user.username}** ha sido baneado.\n**Razón:** ${razon}`)],
                    components: [],
                });
            } catch {
                await i.update({ content: '❌ Error al banear al usuario.', embeds: [], components: [] });
            }
        });

        collector.on('end', (col, reason) => {
            if (reason === 'time') {
                msg.edit({ embeds: [embed.setFooter({ text: 'Confirmación expirada.' })], components: [] }).catch(() => {});
            }
        });
    },
};
