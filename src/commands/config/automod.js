const {
    SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits,
} = require('discord.js');
const GuildConfig = require('../../../models/GuildConfig');

const MODULES = {
    links:    { key: 'filterLinks',   label: '🔗 Links externos' },
    invites:  { key: 'filterInvites', label: '📨 Invitaciones de Discord' },
    spam:     { key: 'filterSpam',    label: '🔁 Spam (mensajes repetidos)' },
};

module.exports = {
    name: 'automod',
    description: 'Configura el sistema de automoderación del servidor.',
    category: 'config',
    permissions: [PermissionFlagsBits.ManageGuild],
    data: new SlashCommandBuilder()
        .setName('automod')
        .setDescription('Configura el sistema de automoderación.')
        // ── setup ──────────────────────────────────────────────────────────
        .addSubcommand((sub) =>
            sub.setName('setup')
                .setDescription('Muestra el estado actual del automod y sus opciones.')
        )
        // ── toggle ─────────────────────────────────────────────────────────
        .addSubcommand((sub) =>
            sub.setName('toggle')
                .setDescription('Activa o desactiva un módulo de automod.')
                .addStringOption((o) =>
                    o.setName('modulo')
                        .setDescription('Módulo a cambiar.')
                        .setRequired(true)
                        .addChoices(
                            { name: '🔗 Links externos',             value: 'links' },
                            { name: '📨 Invitaciones de Discord',    value: 'invites' },
                            { name: '🔁 Spam (mensajes repetidos)', value: 'spam' },
                            { name: '🌐 Automod global (on/off)',    value: 'enabled' },
                        )
                )
        )
        // ── accion ─────────────────────────────────────────────────────────
        .addSubcommand((sub) =>
            sub.setName('accion')
                .setDescription('Cambia la acción que aplica el automod al detectar una infracción.')
                .addStringOption((o) =>
                    o.setName('tipo')
                        .setDescription('Acción a aplicar.')
                        .setRequired(true)
                        .addChoices(
                            { name: '🗑️ Solo eliminar el mensaje',    value: 'delete' },
                            { name: '⚠️ Eliminar y añadir un warn',   value: 'warn' },
                            { name: '⏱️ Eliminar y aplicar timeout',  value: 'timeout' },
                        )
                )
        )
        // ── badwords ───────────────────────────────────────────────────────
        .addSubcommand((sub) =>
            sub.setName('badwords')
                .setDescription('Añade o elimina palabras prohibidas.')
                .addStringOption((o) =>
                    o.setName('accion')
                        .setDescription('Añadir o eliminar.')
                        .setRequired(true)
                        .addChoices(
                            { name: '➕ Añadir',   value: 'add' },
                            { name: '➖ Eliminar',  value: 'remove' },
                            { name: '📋 Listar',   value: 'list' },
                        )
                )
                .addStringOption((o) =>
                    o.setName('palabra')
                        .setDescription('Palabra a añadir o eliminar.')
                        .setRequired(false)
                )
        )
        // ── eximir ─────────────────────────────────────────────────────────
        .addSubcommand((sub) =>
            sub.setName('eximir')
                .setDescription('Exime un canal o rol del automod.')
                .addStringOption((o) =>
                    o.setName('tipo')
                        .setDescription('Canal o rol.')
                        .setRequired(true)
                        .addChoices(
                            { name: '💬 Canal',  value: 'channel' },
                            { name: '🎭 Rol',    value: 'role' },
                        )
                )
                .addChannelOption((o) => o.setName('canal').setDescription('Canal a eximir.').setRequired(false))
                .addRoleOption((o)    => o.setName('rol').setDescription('Rol a eximir.').setRequired(false))
        ),

    async execute(ctx) {
        const sub = ctx.getSubcommand();

        const getCfg = async () => {
            const cfg = await GuildConfig.findOne({ guildId: ctx.guild.id });
            return cfg?.automod || {};
        };

        const updateCfg = async (update) => {
            return GuildConfig.findOneAndUpdate(
                { guildId: ctx.guild.id },
                { $set: update },
                { upsert: true, new: true }
            );
        };

        // ── setup ────────────────────────────────────────────────────────────
        if (sub === 'setup') {
            const am = await getCfg();
            const onOff = (v) => v ? '✅ Activado' : '❌ Desactivado';

            const embed = new EmbedBuilder()
                .setColor(am.enabled ? 'Green' : 'Red')
                .setTitle('🛡️ Automod — Estado actual')
                .addFields(
                    { name: '🌐 Automod global',        value: onOff(am.enabled),       inline: true  },
                    { name: '🔗 Filtro de links',        value: onOff(am.filterLinks),   inline: true  },
                    { name: '📨 Filtro de invitaciones', value: onOff(am.filterInvites), inline: true  },
                    { name: '🔁 Filtro de spam',         value: onOff(am.filterSpam),    inline: true  },
                    { name: '⚠️ Acción',                 value: am.action || 'delete',   inline: true  },
                    { name: '🔤 Palabras prohibidas',    value: `${(am.badWords || []).length} palabras`, inline: true },
                    {
                        name: '🚫 Canales exentos',
                        value: (am.exemptChannels || []).map((id) => `<#${id}>`).join(', ') || 'Ninguno',
                        inline: false,
                    },
                    {
                        name: '🎭 Roles exentos',
                        value: (am.exemptRoles || []).map((id) => `<@&${id}>`).join(', ') || 'Ninguno',
                        inline: false,
                    },
                )
                .setFooter({ text: 'Usa /automod toggle para activar módulos.' })
                .setTimestamp();

            return ctx.reply({ embeds: [embed] });
        }

        // ── toggle ────────────────────────────────────────────────────────────
        if (sub === 'toggle') {
            const modulo = ctx.getString('modulo');
            const am     = await getCfg();

            if (modulo === 'enabled') {
                const newVal = !am.enabled;
                await updateCfg({ 'automod.enabled': newVal });
                return ctx.reply({ content: `🛡️ Automod global: ${newVal ? '✅ Activado' : '❌ Desactivado'}.` });
            }

            const moduleKey = MODULES[modulo]?.key;
            if (!moduleKey) return ctx.reply({ content: '❌ Módulo no reconocido.', ephemeral: true });

            const newVal = !am[moduleKey];
            await updateCfg({ [`automod.${moduleKey}`]: newVal });
            return ctx.reply({
                content: `${MODULES[modulo].label}: ${newVal ? '✅ Activado' : '❌ Desactivado'}.`,
            });
        }

        // ── accion ────────────────────────────────────────────────────────────
        if (sub === 'accion') {
            const tipo = ctx.getString('tipo');
            await updateCfg({ 'automod.action': tipo });
            const labels = { delete: '🗑️ Solo eliminar', warn: '⚠️ Eliminar + warn', timeout: '⏱️ Eliminar + timeout' };
            return ctx.reply({ content: `✅ Acción del automod cambiada a: **${labels[tipo] || tipo}**` });
        }

        // ── badwords ──────────────────────────────────────────────────────────
        if (sub === 'badwords') {
            const accion  = ctx.getString('accion');
            const palabra = ctx.getString('palabra')?.toLowerCase().trim();

            if (accion === 'list') {
                const am = await getCfg();
                const words = am.badWords || [];
                return ctx.reply({
                    embeds: [new EmbedBuilder()
                        .setColor('Orange')
                        .setTitle('🔤 Palabras prohibidas')
                        .setDescription(words.length ? words.map((w) => `\`${w}\``).join(', ') : 'Ninguna registrada.')
                        .setFooter({ text: `${words.length} palabras` })],
                    ephemeral: true,
                });
            }

            if (!palabra) return ctx.reply({ content: '❌ Indica la palabra.', ephemeral: true });

            if (accion === 'add') {
                await GuildConfig.findOneAndUpdate(
                    { guildId: ctx.guild.id },
                    { $addToSet: { 'automod.badWords': palabra } },
                    { upsert: true }
                );
                return ctx.reply({ content: `✅ La palabra \`${palabra}\` ha sido añadida a la lista de palabras prohibidas.` });
            }

            if (accion === 'remove') {
                await GuildConfig.findOneAndUpdate(
                    { guildId: ctx.guild.id },
                    { $pull: { 'automod.badWords': palabra } }
                );
                return ctx.reply({ content: `✅ La palabra \`${palabra}\` ha sido eliminada.` });
            }
        }

        // ── eximir ────────────────────────────────────────────────────────────
        if (sub === 'eximir') {
            const tipo    = ctx.getString('tipo');
            const channel = await ctx.getChannel('canal');
            const role    = ctx.getRole('rol');

            if (tipo === 'channel') {
                if (!channel) return ctx.reply({ content: '❌ Indica el canal.', ephemeral: true });
                const am = await getCfg();
                const list = am.exemptChannels || [];
                if (list.includes(channel.id)) {
                    await GuildConfig.findOneAndUpdate(
                        { guildId: ctx.guild.id },
                        { $pull: { 'automod.exemptChannels': channel.id } }
                    );
                    return ctx.reply({ content: `✅ <#${channel.id}> ya no está exento del automod.` });
                } else {
                    await GuildConfig.findOneAndUpdate(
                        { guildId: ctx.guild.id },
                        { $addToSet: { 'automod.exemptChannels': channel.id } },
                        { upsert: true }
                    );
                    return ctx.reply({ content: `✅ <#${channel.id}> está ahora exento del automod.` });
                }
            }

            if (tipo === 'role') {
                if (!role) return ctx.reply({ content: '❌ Indica el rol.', ephemeral: true });
                const am = await getCfg();
                const list = am.exemptRoles || [];
                if (list.includes(role.id)) {
                    await GuildConfig.findOneAndUpdate(
                        { guildId: ctx.guild.id },
                        { $pull: { 'automod.exemptRoles': role.id } }
                    );
                    return ctx.reply({ content: `✅ El rol <@&${role.id}> ya no está exento del automod.` });
                } else {
                    await GuildConfig.findOneAndUpdate(
                        { guildId: ctx.guild.id },
                        { $addToSet: { 'automod.exemptRoles': role.id } },
                        { upsert: true }
                    );
                    return ctx.reply({ content: `✅ El rol <@&${role.id}> está ahora exento del automod.` });
                }
            }
        }
    },
};
