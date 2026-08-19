const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } = require('discord.js');
const GuildConfig = require('../../../models/GuildConfig');

module.exports = {
    name: 'setlogs',
    description: 'Configura el canal de logs de moderación del servidor.',
    category: 'config',
    permissions: [PermissionFlagsBits.ManageGuild],
    data: new SlashCommandBuilder()
        .setName('setlogs')
        .setDescription('Configura el canal de logs de moderación del servidor.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand((sub) =>
            sub.setName('set')
                .setDescription('Establece el canal de logs.')
                .addChannelOption((o) =>
                    o.setName('canal')
                        .setDescription('Canal donde se enviarán los logs.')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true)
                )
        )
        .addSubcommand((sub) =>
            sub.setName('disable')
                .setDescription('Desactiva los logs de moderación.')
        ),

    async execute(ctx) {
        const sub = ctx.getSubcommand();

        if (sub === 'set') {
            const channel = await ctx.getChannel('canal');
            if (!channel?.isTextBased()) {
                return ctx.reply({ content: '❌ El canal no es válido o no es de texto.', ephemeral: true });
            }

            // Verify the bot can actually send messages there
            if (!channel.permissionsFor(ctx.guild.members.me)?.has('SendMessages')) {
                return ctx.reply({ content: `❌ No tengo permiso para enviar mensajes en ${channel}.`, ephemeral: true });
            }

            await GuildConfig.findOneAndUpdate(
                { guildId: ctx.guild.id },
                { logsChannel: channel.id },
                { upsert: true, new: true }
            );

            const embed = new EmbedBuilder()
                .setColor('Green')
                .setTitle('✅ Canal de logs configurado')
                .setDescription(`Los eventos de moderación se registrarán en ${channel}.`)
                .addFields({
                    name: '📋 Eventos registrados',
                    value: [
                        '• Miembro entró / salió / expulsado',
                        '• Nickname y roles cambiados · Timeout',
                        '• Mensajes eliminados / editados',
                        '• Canales y roles creados / modificados / eliminados',
                        '• Bans y unbans',
                        '• Voz: entrar / salir / mover',
                        '• Servidor modificado',
                        '• Emojis e invitaciones',
                    ].join('\n'),
                    inline: false,
                })
                .setFooter({ text: `Configurado por ${ctx.user.username}` })
                .setTimestamp();

            return ctx.reply({ embeds: [embed] });
        }

        if (sub === 'disable') {
            await GuildConfig.findOneAndUpdate(
                { guildId: ctx.guild.id },
                { logsChannel: null },
                { upsert: true }
            );

            const embed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('🚫 Logs desactivados')
                .setDescription('Los logs de moderación han sido desactivados en este servidor.')
                .setTimestamp();

            return ctx.reply({ embeds: [embed] });
        }
    },
};
