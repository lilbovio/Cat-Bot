const UserLevel = require('../models/UserLevel');

module.exports = {
    name: 'restartlevel',
    description: 'Reinicia el sistema de nivelación para todos los usuarios del servidor.',
    async execute(interaction) {
        if (!interaction.member.permissions.has('Administrator')) {
            return interaction.reply({ content: 'No tienes permisos para usar este comando.', ephemeral: true });
        }

        await UserLevel.deleteMany({ guildId: interaction.guild.id });
        interaction.reply('El sistema de nivelación ha sido reiniciado. Todos los niveles han sido restablecidos a 0.');
    },
};
