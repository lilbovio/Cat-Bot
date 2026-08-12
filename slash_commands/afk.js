const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const AFK = require('../models/afkSchema');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('afk')
        .setDescription('Ponerse en estado AFK.')
        .addStringOption(option =>
            option.setName('razon')
                .setDescription('Razón de por qué estás AFK.')
                .setRequired(false)
        ),
        
    async execute(interaction) {
        const reason = interaction.options.getString('razon') || "Sin razón";

        await AFK.findOneAndUpdate(
            { userId: interaction.user.id },  // ← Cambiado a `userId`
            { reason, timestamp: Date.now() },
            { upsert: true, new: true }
        );

        const embed = new EmbedBuilder()
            .setColor('Blue')
            .setTitle('🛌 Modo AFK activado')
            .setDescription(`Tu estado AFK ha sido activado.\n**Razón:** ${reason}`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
