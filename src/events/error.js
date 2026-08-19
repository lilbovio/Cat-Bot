const { Events } = require('discord.js');
const config = require('../../config');
const logger = require('../utils/logger');

module.exports = {
    name: Events.Error,
    async execute(client, error) {
        logger.error('Error no controlado:', error);

        try {
            const channel = await client.channels.fetch(config.channels.error);
            if (channel?.isTextBased()) {
                const content = `⚠️ **Se produjo un error no controlado:**\n\`\`\`${(error.stack || error.message).slice(0, 1900)}\`\`\``;
                await channel.send({ content });
            }
        } catch (err) {
            logger.warn('No se pudo enviar el error al canal:', err.message);
        }
    },
};
