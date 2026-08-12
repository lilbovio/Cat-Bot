const { SlashCommandBuilder } = require('discord.js');
const Warn = require('../models/WarnSchema');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('seewarns')
        .setDescription('Muestra la lista de warns de un usuario.')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('El usuario a consultar')
                .setRequired(true)),

    async execute(interaction) {
        const target = interaction.options.getUser('usuario');
        const guildId = interaction.guild.id;

        const warnData = await Warn.findOne({ guildId, userId: target.id });

        if (!warnData || warnData.warns.length === 0) {
            return interaction.reply({ content: `✅ **${target.tag}** no tiene warns.`, ephemeral: true });
        }

        const warnList = warnData.warns.map((warn, index) =>
            `**${index + 1}.** Razón: ${warn.reason} | Moderador: <@${warn.moderatorId}> | Fecha: <t:${Math.floor(warn.date / 1000)}:F>`
        ).join('\n');

        return interaction.reply({
            content: `⚠️ **Warns de ${target.tag}:**\n${warnList}`,
            ephemeral: true
        });
    }
};
