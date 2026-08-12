const { EmbedBuilder, ChannelType } = require('discord.js');

module.exports = {
    name: 'chinfo',
    description: 'Muestra información del canal.',
    execute(message) {
        const channel = message.channel;
        const embed = new EmbedBuilder()
            .setTitle('Información del Canal')
            .setColor('Blue')
            .addFields([
                { name: 'Nombre', value: channel.name || 'N/A', inline: true },
                { name: 'ID', value: channel.id, inline: true },
                { name: 'Tipo', value: ChannelType[channel.type] || 'Desconocido', inline: true },
                { name: 'NSFW', value: channel.nsfw ? 'Sí' : 'No', inline: true },
                { name: 'Descripción', value: channel.topic ? channel.topic : 'Sin descripción', inline: false },
                { name: 'Fecha de Creación', value: `<t:${Math.floor(channel.createdTimestamp / 1000)}:F>`, inline: false },
            ])
            .setFooter({ text: `Solicitado por ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

        message.channel.send({ embeds: [embed] });
    },
};
