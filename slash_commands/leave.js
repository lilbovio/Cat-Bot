const { SlashCommandBuilder } = require('discord.js');
const { adminID } = require('../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Expulsa al bot de un servidor usando su ID.')
        .addStringOption(option => 
            option.setName('server_id')
            .setDescription('ID del servidor del que quieres sacar al bot')
            .setRequired(true)
        ),
    async execute(interaction) {
        if (interaction.user.id !== adminID) {
            return interaction.reply({ content: '❌ No tienes permiso para usar este comando.', ephemeral: true });
        }

        const serverId = interaction.options.getString('server_id');
        const guild = interaction.client.guilds.cache.get(serverId);

        if (!guild) {
            return interaction.reply({ content: '❌ No estoy en un servidor con esa ID.', ephemeral: true });
        }

        try {
            await guild.leave();
            interaction.reply({ content: `✅ He salido del servidor **${guild.name}** (ID: ${serverId}).`, ephemeral: true });
        } catch (error) {
            console.error(`Error al salir del servidor: ${error}`);
            interaction.reply({ content: '❌ No pude salir del servidor. Verifica la ID y vuelve a intentarlo.', ephemeral: true });
        }
    }
};
