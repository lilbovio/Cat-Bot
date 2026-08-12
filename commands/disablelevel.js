const GuildConfig = require('../models/GuildConfig');

module.exports = {
    name: 'disablelevel',
    description: 'Desactiva el sistema de nivelación en el servidor.',
    async execute(interaction) {
        if (!interaction.member.permissions.has('Administrator')) {
            return interaction.reply({ content: 'No tienes permisos para usar este comando.', ephemeral: true });
        }

        await GuildConfig.findOneAndUpdate(
            { guildId: interaction.guild.id },
            { levelingEnabled: false },
            { upsert: true }
        );

        interaction.reply('El sistema de nivelación ha sido desactivado en este servidor.');
    },
};
