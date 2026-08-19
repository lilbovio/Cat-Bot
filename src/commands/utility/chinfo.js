const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');

module.exports = {
    name: 'chinfo',
    description: 'Muestra información del canal actual.',
    category: 'utility',
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('chinfo')
        .setDescription('Muestra información del canal actual.'),
    async execute(ctx) {
        const channel = ctx.channel;
        const embed = new EmbedBuilder()
            .setTitle('Información del Canal')
            .setColor('Blue')
            .addFields(
                { name: 'Nombre', value: channel.name || 'N/A', inline: true },
                { name: 'ID', value: channel.id, inline: true },
                { name: 'Tipo', value: ChannelType[channel.type] || 'Desconocido', inline: true },
                { name: 'NSFW', value: channel.nsfw ? 'Sí' : 'No', inline: true },
                { name: 'Descripción', value: channel.topic || 'Sin descripción', inline: false },
                { name: 'Creado el', value: `<t:${Math.floor(channel.createdTimestamp / 1000)}:F>`, inline: false }
            )
            .setFooter({ text: `Solicitado por ${ctx.user.username}`, iconURL: ctx.user.displayAvatarURL() });

        await ctx.reply({ embeds: [embed] });
    },
};
