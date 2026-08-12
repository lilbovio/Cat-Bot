const { SlashCommandBuilder } = require('discord.js');
const Warn = require('../models/WarnSchema');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Advierte a un usuario y registra el warn en la base de datos.')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('El usuario a advertir')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('razon')
                .setDescription('Razón del warn')
                .setRequired(true)),

    async execute(interaction) {
        if (!interaction.member.permissions.has('ModerateMembers')) {
            return interaction.reply({ content: '❌ No tienes permiso para usar este comando.', ephemeral: true });
        }

        const target = interaction.options.getUser('usuario');
        const reason = interaction.options.getString('razon');
        const guildId = interaction.guild.id;

        let warnData = await Warn.findOne({ guildId, userId: target.id });

        if (!warnData) {
            warnData = new Warn({ guildId, userId: target.id, warns: [] });
        }

        warnData.warns.push({ reason, moderatorId: interaction.user.id });
        await warnData.save();

        return interaction.reply({
            content: `⚠️ **${target.tag}** ha sido advertido por: **${reason}**\nNúmero total de warns: **${warnData.warns.length}**`
        });
    },

    async executePrefix(message, args) {
        if (!message.member.permissions.has('ModerateMembers')) {
            return message.reply('❌ No tienes permiso para usar este comando.');
        }

        const target = message.mentions.users.first();
        const reason = args.slice(1).join(' ');
        const guildId = message.guild.id;

        if (!target || !reason) {
            return message.reply('Uso correcto: `!warn @usuario razón`');
        }

        let warnData = await Warn.findOne({ guildId, userId: target.id });

        if (!warnData) {
            warnData = new Warn({ guildId, userId: target.id, warns: [] });
        }

        warnData.warns.push({ reason, moderatorId: message.author.id });
        await warnData.save();

        return message.reply(`⚠️ **${target.tag}** ha sido advertido por: **${reason}**\nNúmero total de warns: **${warnData.warns.length}**`);
    }
};
