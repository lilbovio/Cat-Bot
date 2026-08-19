const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const GuildConfig = require('../../../models/GuildConfig');

const MIN_LEN = 1;
const MAX_LEN = 5;

module.exports = {
    name: 'setprefix',
    description: 'Cambia el prefijo de texto del bot en este servidor.',
    category: 'config',
    permissions: [PermissionFlagsBits.ManageGuild],
    data: new SlashCommandBuilder()
        .setName('setprefix')
        .setDescription('Cambia el prefijo de texto del bot en este servidor.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addStringOption((o) =>
            o.setName('prefijo')
                .setDescription(`Nuevo prefijo (${MIN_LEN}–${MAX_LEN} caracteres).`)
                .setRequired(true)
                .setMinLength(MIN_LEN)
                .setMaxLength(MAX_LEN)
        ),
    async execute(ctx) {
        const newPrefix = ctx.getString('prefijo')?.trim();
        if (!newPrefix || newPrefix.length < MIN_LEN || newPrefix.length > MAX_LEN) {
            return ctx.reply({ content: `❌ El prefijo debe tener entre ${MIN_LEN} y ${MAX_LEN} caracteres.`, ephemeral: true });
        }

        await GuildConfig.findOneAndUpdate(
            { guildId: ctx.guild.id },
            { prefix: newPrefix },
            { upsert: true, new: true }
        );

        const embed = new EmbedBuilder()
            .setColor('Green')
            .setTitle('✅ Prefijo actualizado')
            .setDescription(`El nuevo prefijo es: \`${newPrefix}\`\nEjemplo: \`${newPrefix}help\``)
            .setFooter({ text: `Cambiado por ${ctx.user.username}` })
            .setTimestamp();

        await ctx.reply({ embeds: [embed] });
    },
};
