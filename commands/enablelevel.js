const GuildConfig = require('../models/GuildConfig');

module.exports = {
    name: 'enablelevel',
    description: 'Activa el sistema de nivelación en este servidor.',
    async execute(messageOrInteraction) {
        const isSlash = messageOrInteraction.isCommand?.();
        const guildId = isSlash ? messageOrInteraction.guildId : messageOrInteraction.guild.id;

        try {
            const guildConfig = await GuildConfig.findOneAndUpdate(
                { guildId },
                { levelingEnabled: true },
                { new: true, upsert: true }
            );
            const response = '¡El sistema de nivelación ha sido activado en este servidor!';
            if (isSlash) {
                await messageOrInteraction.reply(response);
            } else {
                await messageOrInteraction.channel.send(response);
            }
        } catch (error) {
            console.error(error);
            const errorMsg = 'Hubo un error activando el sistema de nivelación.';
            if (isSlash) {
                await messageOrInteraction.reply(errorMsg);
            } else {
                await messageOrInteraction.channel.send(errorMsg);
            }
        }
    },
};
