const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Muestra el ping del bot.'),
    name: 'ping',
    description: 'Muestra el ping del bot.',
    async execute(interaction) {
        await interaction.reply(`Pong! El ping es ${Date.now() - interaction.createdTimestamp}ms.`);
    },
};
