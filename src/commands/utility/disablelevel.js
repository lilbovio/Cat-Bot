const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const GuildConfig = require('../../../models/GuildConfig');

module.exports = {
    name: 'disablelevel',
    description: 'Desactiva el sistema de nivelación en este servidor.',
    category: 'utility',
    permissions: [PermissionFlagsBits.Administrator],
    data: new SlashCommandBuilder()
        .setName('disablelevel')
        .setDescription('Desactiva el sistema de nivelación en este servidor.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(ctx) {
        const cfg = await GuildConfig.findOne({ guildId: ctx.guild.id });
        if (cfg && cfg.levelingEnabled === false) {
            return ctx.reply({ content: '⚠️ El sistema de nivelación ya está desactivado en este servidor.', ephemeral: true });
        }

        await GuildConfig.findOneAndUpdate(
            { guildId: ctx.guild.id },
            { levelingEnabled: false },
            { upsert: true, new: true }
        );

        const embed = new EmbedBuilder()
            .setColor('Red')
            .setTitle('🚫 Nivelación desactivada')
            .setDescription('El sistema de nivelación ha sido **desactivado** en este servidor.\nLos datos de XP existentes se conservan.')
            .setFooter({ text: `Desactivado por ${ctx.user.username}` })
            .setTimestamp();

        await ctx.reply({ embeds: [embed] });
    },
};
