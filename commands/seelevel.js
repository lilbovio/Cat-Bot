const UserLevel = require('../models/UserLevel');

module.exports = {
    name: 'seelevel',
    description: 'Muestra el top 10 de usuarios con el mayor nivel en el servidor.',
    async execute(interaction) {
        const topUsers = await UserLevel.find({ guildId: interaction.guild.id })
            .sort({ level: -1, messages: -1 })
            .limit(10);

        if (topUsers.length === 0) {
            return interaction.reply('No hay usuarios registrados en el sistema de nivelación.');
        }

        const leaderboard = topUsers
            .map((user, index) => `**#${index + 1}** <@${user.userId}> - Nivel ${user.level}`)
            .join('\n');

        interaction.reply({ content: `**Top 10 Usuarios con Mayor Nivel:**\n${leaderboard}` });
    },
};
