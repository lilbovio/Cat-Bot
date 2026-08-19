const { Events, ActivityType } = require('discord.js');
const config = require('../../config');
const logger = require('../utils/logger');
const { registerSlashCommands } = require('../loaders/registerSlashCommands');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        logger.info(`🤖 Bot listo como ${client.user.username} | ${client.guilds.cache.size} servidor(es)`);

        client.user.setPresence({
            activities: [{ name: 'CatBot!', type: ActivityType.Playing }],
            status: 'dnd',
        });

        // Registrar slash commands en todos los servidores ahora que las guilds están cacheadas
        await registerSlashCommands(client);

        // Mensaje de inicio en el canal configurado
        try {
            const channel = await client.channels.fetch(config.channels.startup);
            if (channel?.isTextBased()) {
                await channel.send('✅ El bot está encendido.');
            }
        } catch {
            // canal no configurado o sin acceso — no es crítico
        }
    },
};
