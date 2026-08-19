const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const GuildConfig = require('../../../models/GuildConfig');

module.exports = {
    name: 'serverconfig',
    description: 'Muestra la configuración actual de CatBot en este servidor.',
    category: 'config',
    cooldown: 5,
    permissions: [PermissionFlagsBits.ManageGuild],
    data: new SlashCommandBuilder()
        .setName('serverconfig')
        .setDescription('Muestra la configuración actual de CatBot en este servidor.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async execute(ctx) {
        const cfg = await GuildConfig.findOne({ guildId: ctx.guild.id });

        const none = '*No configurado*';

        const prefixVal         = cfg?.prefix          ?? '!';
        const logsVal           = cfg?.logsChannel     ? `<#${cfg.logsChannel}>`  : none;
        const welcomeChanVal    = cfg?.welcomeChannel  ? `<#${cfg.welcomeChannel}>` : none;
        const welcomeMsgVal     = cfg?.welcomeMessage  ? cfg.welcomeMessage.slice(0, 200) : none;
        const welcomeImgVal     = cfg?.welcomeImage    ? `[Ver imagen](${cfg.welcomeImage})` : none;
        const autoRoleVal       = cfg?.autoRole        ? `<@&${cfg.autoRole}>`    : none;
        const levelingVal       = (cfg && cfg.levelingEnabled === false) ? '🔴 Desactivado' : '🟢 Activado';

        const embed = new EmbedBuilder()
            .setColor('Blue')
            .setTitle(`⚙️ Configuración de ${ctx.guild.name}`)
            .setThumbnail(ctx.guild.iconURL({ dynamic: true }))
            .addFields(
                { name: '🔤 Prefijo',          value: `\`${prefixVal}\``, inline: true },
                { name: '⭐ Nivelación',        value: levelingVal,        inline: true },
                { name: '\u200b',               value: '\u200b',           inline: true }, // spacer
                { name: '📋 Canal de logs',     value: logsVal,            inline: true },
                { name: '🎭 Auto-rol',          value: autoRoleVal,        inline: true },
                { name: '\u200b',               value: '\u200b',           inline: true }, // spacer
                { name: '📥 Canal de bienvenida', value: welcomeChanVal,   inline: true },
                { name: '💬 Mensaje de bienvenida', value: welcomeMsgVal,  inline: false },
                { name: '🖼️ Imagen de bienvenida',  value: welcomeImgVal, inline: true },
            )
            .setFooter({ text: `ID del servidor: ${ctx.guild.id}` })
            .setTimestamp();

        await ctx.reply({ embeds: [embed], ephemeral: true });
    },
};
