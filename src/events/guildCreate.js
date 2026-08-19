const { Events, EmbedBuilder } = require('discord.js');
const config = require('../../config');
const logger = require('../utils/logger');

module.exports = {
    name: Events.GuildCreate,
    async execute(client, guild) {
        logger.info(`Bot añadido al servidor: ${guild.name} (${guild.id})`);

        // Log al canal de logs del creador
        try {
            const logChannel = await client.channels.fetch(config.channels.guildLog);
            if (logChannel?.isTextBased()) {
                const embed = new EmbedBuilder()
                    .setTitle('El bot fue añadido a un nuevo servidor')
                    .addFields(
                        { name: 'Nombre del servidor', value: guild.name, inline: true },
                        { name: 'ID del servidor', value: guild.id, inline: true },
                        { name: 'Miembros', value: `${guild.memberCount}`, inline: true },
                        { name: 'Propietario', value: `<@${guild.ownerId}>`, inline: true },
                        { name: 'Cantidad de canales', value: `${guild.channels.cache.size}`, inline: true },
                        { name: 'Roles', value: `${guild.roles.cache.size}`, inline: true }
                    )
                    .setThumbnail(guild.iconURL({ dynamic: true }) || null)
                    .setColor('Blue')
                    .setTimestamp();
                await logChannel.send({ embeds: [embed] });
            }
        } catch (err) {
            logger.warn('Error al enviar el log de servidor nuevo:', err.message);
        }

        // Mensaje en el canal predeterminado del servidor
        const defaultChannel = guild.channels.cache.find(
            (channel) =>
                channel.type === 0 &&
                channel.permissionsFor(guild.members.me)?.has('SendMessages')
        );

        if (defaultChannel) {
            try {
                await defaultChannel.send(
                    '¡Hola! Gracias por añadir el bot a tu servidor. Escribe `/help` para ver la lista de comandos.'
                );
            } catch (err) {
                logger.warn('Error al enviar el mensaje al canal predeterminado:', err.message);
            }
        }
    },
};
