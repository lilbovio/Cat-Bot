const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'serverinfo',
    description: 'Muestra información del servidor.',
    category: 'utility',
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Muestra información del servidor.'),
    async execute(ctx) {
        const guild = ctx.guild;
        if (!guild) return ctx.reply('Este comando solo puede ejecutarse dentro de un servidor.');

        const embed = new EmbedBuilder()
            .setTitle('Información del Servidor')
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .setColor('Green')
            .addFields(
                { name: 'Nombre', value: guild.name, inline: true },
                { name: 'ID', value: guild.id, inline: true },
                { name: 'Propietario', value: `<@${guild.ownerId}>`, inline: true },
                { name: 'Miembros', value: `${guild.memberCount}`, inline: true },
                { name: 'Canales', value: `${guild.channels.cache.size}`, inline: true },
                { name: 'Roles', value: `${guild.roles.cache.size}`, inline: true },
                { name: 'Creado el', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: false }
            )
            .setTimestamp();

        await ctx.reply({ embeds: [embed] });
    },
};
