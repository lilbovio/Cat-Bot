const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'unlock',
    description: 'Desbloquea el canal actual.',
    category: 'moderation',
    cooldown: 5,
    permissions: [PermissionFlagsBits.ManageChannels],
    data: new SlashCommandBuilder()
        .setName('unlock')
        .setDescription('Desbloquea el canal actual.'),
    async execute(ctx) {
        await ctx.channel.permissionOverwrites.edit(ctx.guild.roles.everyone, { SendMessages: true });

        const embed = new EmbedBuilder()
            .setTitle('🔓 Canal desbloqueado')
            .setColor('Green')
            .setDescription(`El canal ${ctx.channel} ha sido desbloqueado. Los mensajes están habilitados.`)
            .setFooter({ text: `Desbloqueado por ${ctx.user.username}` })
            .setTimestamp();

        await ctx.reply({ embeds: [embed] });
    },
};
