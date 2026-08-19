const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'lock',
    description: 'Bloquea el canal actual para que nadie pueda enviar mensajes.',
    category: 'moderation',
    cooldown: 5,
    permissions: [PermissionFlagsBits.ManageChannels],
    data: new SlashCommandBuilder()
        .setName('lock')
        .setDescription('Bloquea el canal actual para que nadie pueda enviar mensajes.'),
    async execute(ctx) {
        await ctx.channel.permissionOverwrites.edit(ctx.guild.roles.everyone, { SendMessages: false });

        const embed = new EmbedBuilder()
            .setTitle('🔒 Canal bloqueado')
            .setColor('Red')
            .setDescription(`El canal ${ctx.channel} ha sido bloqueado. Nadie puede enviar mensajes.`)
            .setFooter({ text: `Bloqueado por ${ctx.user.username}` })
            .setTimestamp();

        await ctx.reply({ embeds: [embed] });
    },
};
