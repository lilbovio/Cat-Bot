const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'serverinfo',
    description: 'Muestra la información del servidor.',
    async execute(message, args) {
        const guild = message.guild;

        if (!guild) {
            return await message.reply('Este comando solo puede ejecutarse dentro de un servidor.');
        }

        const embed = new EmbedBuilder()
            .setTitle('Información del Servidor')
            .addFields([
                { name: 'Nombre', value: guild.name, inline: true },
                { name: 'ID', value: guild.id, inline: true },
                { name: 'Miembros', value: `${guild.memberCount}`, inline: true },
                { name: 'Creado el', value: guild.createdAt.toDateString(), inline: true },
                { name: 'Propietario', value: `<@${guild.ownerId}>`, inline: true },
            ])
            .setThumbnail(guild.iconURL())
            .setColor('Green');

        await message.reply({ embeds: [embed] });
    },
};
