const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } = require('discord.js');
const GuildConfig = require('../../../models/GuildConfig');

module.exports = {
    name: 'setwelcome',
    description: 'Configura el sistema de bienvenida del servidor.',
    category: 'config',
    permissions: [PermissionFlagsBits.ManageGuild],
    data: new SlashCommandBuilder()
        .setName('setwelcome')
        .setDescription('Configura el sistema de bienvenida del servidor.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        // ── set ──────────────────────────────────────────────────────────────
        .addSubcommand((sub) =>
            sub.setName('set')
                .setDescription('Activa la bienvenida en un canal con un mensaje personalizado.')
                .addChannelOption((o) =>
                    o.setName('canal')
                        .setDescription('Canal donde enviar el mensaje de bienvenida.')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true)
                )
                .addStringOption((o) =>
                    o.setName('mensaje')
                        .setDescription('Mensaje de bienvenida. Usa {usuario} para mencionar al nuevo miembro.')
                        .setRequired(true)
                )
                .addStringOption((o) =>
                    o.setName('imagen')
                        .setDescription('URL de una imagen opcional para el mensaje de bienvenida.')
                        .setRequired(false)
                )
        )
        // ── disable ───────────────────────────────────────────────────────────
        .addSubcommand((sub) =>
            sub.setName('disable')
                .setDescription('Desactiva el mensaje de bienvenida.')
        )
        // ── test ──────────────────────────────────────────────────────────────
        .addSubcommand((sub) =>
            sub.setName('test')
                .setDescription('Envía un mensaje de bienvenida de prueba con tu usuario.')
        ),

    async execute(ctx) {
        const sub = ctx.getSubcommand();

        // ── set ───────────────────────────────────────────────────────────────
        if (sub === 'set') {
            const channel = await ctx.getChannel('canal');
            const mensaje = ctx.getString('mensaje');
            const imagen  = ctx.getString('imagen') || null;

            if (!channel?.isTextBased()) {
                return ctx.reply({ content: '❌ El canal no es válido o no es de texto.', ephemeral: true });
            }

            await GuildConfig.findOneAndUpdate(
                { guildId: ctx.guild.id },
                { welcomeChannel: channel.id, welcomeMessage: mensaje, welcomeImage: imagen },
                { upsert: true, new: true }
            );

            const embed = new EmbedBuilder()
                .setColor('Green')
                .setTitle('✅ Bienvenida configurada')
                .addFields(
                    { name: '📺 Canal',   value: `${channel}`, inline: true },
                    { name: '💬 Mensaje', value: mensaje.slice(0, 512), inline: false },
                    { name: '🖼️ Imagen',  value: imagen ? `[Ver imagen](${imagen})` : 'Ninguna', inline: true },
                )
                .setFooter({ text: 'Usa /setwelcome test para probarla · {usuario} = mención' })
                .setTimestamp();

            return ctx.reply({ embeds: [embed] });
        }

        // ── disable ───────────────────────────────────────────────────────────
        if (sub === 'disable') {
            await GuildConfig.findOneAndUpdate(
                { guildId: ctx.guild.id },
                { welcomeChannel: null, welcomeMessage: null, welcomeImage: null },
                { upsert: true }
            );

            const embed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('🚫 Bienvenida desactivada')
                .setDescription('Los mensajes de bienvenida han sido desactivados en este servidor.')
                .setTimestamp();

            return ctx.reply({ embeds: [embed] });
        }

        // ── test ──────────────────────────────────────────────────────────────
        if (sub === 'test') {
            const cfg = await GuildConfig.findOne({ guildId: ctx.guild.id });
            if (!cfg?.welcomeChannel || !cfg?.welcomeMessage) {
                return ctx.reply({ content: '❌ No hay bienvenida configurada. Usa `/setwelcome set` primero.', ephemeral: true });
            }

            const ch = ctx.guild.channels.cache.get(cfg.welcomeChannel);
            if (!ch?.isTextBased()) {
                return ctx.reply({ content: '❌ El canal configurado ya no existe o no es accesible.', ephemeral: true });
            }

            const text = cfg.welcomeMessage.replace('{usuario}', `<@${ctx.user.id}>`);
            const opts = { content: text };
            if (cfg.welcomeImage) opts.files = [cfg.welcomeImage];
            await ch.send(opts);

            return ctx.reply({ content: `✅ Mensaje de prueba enviado en ${ch}.`, ephemeral: true });
        }
    },
};
