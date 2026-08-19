const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'slowmode',
    description: 'Establece el modo lento (slowmode) del canal actual.',
    category: 'moderation',
    cooldown: 5,
    permissions: [PermissionFlagsBits.ManageChannels],
    data: new SlashCommandBuilder()
        .setName('slowmode')
        .setDescription('Establece el modo lento del canal actual.')
        .addIntegerOption((o) =>
            o.setName('segundos')
                .setDescription('Segundos entre mensajes (0 = desactivar, máx: 21600).')
                .setRequired(true)
                .setMinValue(0)
                .setMaxValue(21600)
        ),
    async execute(ctx) {
        const segundos = ctx.getInteger('segundos');
        await ctx.channel.setRateLimitPerUser(segundos);

        const embed = new EmbedBuilder()
            .setColor(segundos === 0 ? 'Green' : 'Blue')
            .setFooter({ text: `Configurado por ${ctx.user.username}` })
            .setTimestamp();

        if (segundos === 0) {
            embed
                .setTitle('✅ Modo lento desactivado')
                .setDescription(`El modo lento ha sido **desactivado** en ${ctx.channel}.`);
        } else {
            embed
                .setTitle('🐢 Modo lento activado')
                .setDescription(`Modo lento en ${ctx.channel}: **${segundos}s** entre mensajes.`);
        }

        await ctx.reply({ embeds: [embed] });
    },
};
