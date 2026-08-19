const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const GuildConfig = require('../../../models/GuildConfig');

module.exports = {
    name: 'enablelevel',
    description: 'Activa el sistema de nivelación en este servidor.',
    category: 'utility',
    permissions: [PermissionFlagsBits.Administrator],
    data: new SlashCommandBuilder()
        .setName('enablelevel')
        .setDescription('Activa el sistema de nivelación en este servidor.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(ctx) {
        const cfg = await GuildConfig.findOne({ guildId: ctx.guild.id });
        if (cfg && cfg.levelingEnabled === true) {
            return ctx.reply({ content: '⚠️ El sistema de nivelación ya está activado en este servidor.', ephemeral: true });
        }

        await GuildConfig.findOneAndUpdate(
            { guildId: ctx.guild.id },
            { levelingEnabled: true },
            { upsert: true, new: true }
        );

        const embed = new EmbedBuilder()
            .setColor('Green')
            .setTitle('✅ Nivelación activada')
            .setDescription('El sistema de nivelación ha sido **activado** en este servidor.\nLos usuarios ganarán XP al enviar mensajes.')
            .setFooter({ text: `Activado por ${ctx.user.username}` })
            .setTimestamp();

        await ctx.reply({ embeds: [embed] });
    },
};
