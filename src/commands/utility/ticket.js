const {
    SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits,
    ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType,
} = require('discord.js');
const Ticket     = require('../../../models/Ticket');
const GuildConfig = require('../../../models/GuildConfig');

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Resolves the ticket channel name from a ticket number.
 * @param {number} n
 */
function ticketName(n) {
    return `ticket-${String(n).padStart(4, '0')}`;
}

/**
 * Build the transcript text for a closed ticket.
 * @param {object} ticket  Mongoose Ticket document
 */
function buildTranscript(ticket) {
    const lines = ticket.messages.map((m) => {
        const ts  = new Date(m.timestamp).toISOString().replace('T', ' ').slice(0, 19);
        return `[${ts}] ${m.authorId}: ${m.content}`;
    });
    return lines.join('\n') || '(sin mensajes registrados)';
}

module.exports = {
    name: 'ticket',
    description: 'Sistema de tickets de soporte.',
    category: 'utility',
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Sistema de tickets de soporte.')
        // ── create ──────────────────────────────────────────────────────────
        .addSubcommand((sub) =>
            sub.setName('create')
                .setDescription('Abre un nuevo ticket de soporte.')
                .addStringOption((o) =>
                    o.setName('motivo')
                        .setDescription('Motivo del ticket.')
                        .setRequired(false)
                )
        )
        // ── close ───────────────────────────────────────────────────────────
        .addSubcommand((sub) =>
            sub.setName('close')
                .setDescription('Cierra el ticket actual.')
                .addStringOption((o) =>
                    o.setName('razon')
                        .setDescription('Razón del cierre (opcional).')
                        .setRequired(false)
                )
        )
        // ── add ─────────────────────────────────────────────────────────────
        .addSubcommand((sub) =>
            sub.setName('add')
                .setDescription('Añade un usuario al ticket actual.')
                .addUserOption((o) =>
                    o.setName('usuario').setDescription('Usuario a añadir.').setRequired(true)
                )
        )
        // ── setup ───────────────────────────────────────────────────────────
        .addSubcommand((sub) =>
            sub.setName('setup')
                .setDescription('Configura el panel de tickets (admin).')
                .addChannelOption((o) =>
                    o.setName('panel')
                        .setDescription('Canal donde publicar el botón de apertura.')
                        .setRequired(true)
                )
                .addChannelOption((o) =>
                    o.setName('categoria')
                        .setDescription('Categoría donde crear los canales de ticket.')
                        .setRequired(false)
                )
                .addRoleOption((o) =>
                    o.setName('soporte')
                        .setDescription('Rol de soporte con acceso a todos los tickets.')
                        .setRequired(false)
                )
                .addChannelOption((o) =>
                    o.setName('logs')
                        .setDescription('Canal donde enviar logs de tickets.')
                        .setRequired(false)
                )
        ),

    async execute(ctx) {
        const sub = ctx.getSubcommand();

        // ── setup ────────────────────────────────────────────────────────────
        if (sub === 'setup') {
            if (!ctx.member?.permissions?.has(PermissionFlagsBits.ManageGuild)) {
                return ctx.reply({ content: '❌ Necesitas el permiso **Gestionar Servidor**.', ephemeral: true });
            }

            const panelChannel = await ctx.getChannel('panel');
            if (!panelChannel?.isTextBased()) {
                return ctx.reply({ content: '❌ El canal de panel debe ser un canal de texto.', ephemeral: true });
            }

            const catChannel     = await ctx.getChannel('categoria');
            const supportRole    = ctx.getRole('soporte');
            const logsChannel    = await ctx.getChannel('logs');

            // Save config
            await GuildConfig.findOneAndUpdate(
                { guildId: ctx.guild.id },
                {
                    $set: {
                        ticketCategory:   catChannel?.id   ?? null,
                        supportRole:      supportRole?.id  ?? null,
                        ticketLogChannel: logsChannel?.id  ?? null,
                    },
                },
                { upsert: true }
            );

            // Send panel button
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('ticket_open')
                    .setLabel('🎫 Abrir ticket')
                    .setStyle(ButtonStyle.Primary)
            );

            const panelEmbed = new EmbedBuilder()
                .setColor('Blue')
                .setTitle('🎫 Sistema de Tickets')
                .setDescription(
                    'Pulsa el botón de abajo para abrir un ticket de soporte.\nUn miembro del equipo te atenderá en breve.'
                )
                .setFooter({ text: ctx.guild.name })
                .setTimestamp();

            await panelChannel.send({ embeds: [panelEmbed], components: [row] });

            return ctx.reply({
                embeds: [new EmbedBuilder()
                    .setColor('Green')
                    .setTitle('✅ Tickets configurados')
                    .addFields(
                        { name: '📢 Panel',     value: `<#${panelChannel.id}>`,          inline: true },
                        { name: '📁 Categoría', value: catChannel  ? `<#${catChannel.id}>` : 'Sin especificar', inline: true },
                        { name: '🛡️ Soporte',   value: supportRole ? `<@&${supportRole.id}>` : 'Sin especificar', inline: true },
                        { name: '📋 Logs',      value: logsChannel ? `<#${logsChannel.id}>` : 'Sin especificar', inline: true },
                    )
                    .setTimestamp()],
            });
        }

        // ── create ───────────────────────────────────────────────────────────
        if (sub === 'create') {
            return openTicket(ctx.client, ctx.guild, ctx.user, ctx.getString('motivo') || 'Sin motivo', ctx);
        }

        // ── close ────────────────────────────────────────────────────────────
        if (sub === 'close') {
            const ticket = await Ticket.findOne({ channelId: ctx.channel.id, status: 'open' });
            if (!ticket) {
                return ctx.reply({ content: '❌ Este canal no es un ticket abierto.', ephemeral: true });
            }
            return closeTicket(ctx.client, ctx.guild, ctx.channel, ticket, ctx.user, ctx.getString('razon') || 'Sin razón', ctx);
        }

        // ── add ──────────────────────────────────────────────────────────────
        if (sub === 'add') {
            const ticket = await Ticket.findOne({ channelId: ctx.channel.id, status: 'open' });
            if (!ticket) {
                return ctx.reply({ content: '❌ Este canal no es un ticket abierto.', ephemeral: true });
            }

            const targetUser = await ctx.getUser('usuario');
            if (!targetUser) return ctx.reply({ content: '❌ Usuario no encontrado.', ephemeral: true });

            const targetMember = await ctx.guild.members.fetch(targetUser.id).catch(() => null);
            if (!targetMember) return ctx.reply({ content: '❌ El usuario no está en el servidor.', ephemeral: true });

            await ctx.channel.permissionOverwrites.create(targetMember, {
                ViewChannel: true,
                SendMessages: true,
                ReadMessageHistory: true,
            });

            return ctx.reply({ content: `✅ <@${targetUser.id}> ha sido añadido al ticket.` });
        }
    },
};

// ── Shared helpers (also exported for button handler) ────────────────────────

async function openTicket(client, guild, user, reason, ctx = null) {
    const guildConfig = await GuildConfig.findOneAndUpdate(
        { guildId: guild.id },
        { $inc: { ticketCounter: 1 } },
        { upsert: true, new: true }
    );

    const number = guildConfig.ticketCounter;
    const name   = ticketName(number);

    // Check if user already has an open ticket
    const existing = await Ticket.findOne({ guildId: guild.id, userId: user.id, status: 'open' });
    if (existing) {
        const msg = `❌ Ya tienes un ticket abierto: <#${existing.channelId}>`;
        if (ctx) return ctx.reply({ content: msg, ephemeral: true });
        return { error: msg };
    }

    // Resolve category
    const category = guildConfig.ticketCategory
        ? guild.channels.cache.get(guildConfig.ticketCategory)
        : null;

    // Permissions
    const permOverwrites = [
        { id: guild.id, deny: ['ViewChannel'] }, // @everyone can't see
        { id: user.id,  allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'] },
    ];
    if (guildConfig.supportRole) {
        const role = guild.roles.cache.get(guildConfig.supportRole);
        if (role) permOverwrites.push({ id: role.id, allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'] });
    }
    // Bot needs access too
    if (guild.members.me) {
        permOverwrites.push({ id: guild.members.me.id, allow: ['ViewChannel', 'SendMessages', 'ManageChannels', 'ReadMessageHistory'] });
    }

    let channel;
    try {
        channel = await guild.channels.create({
            name,
            type: ChannelType.GuildText,
            parent: category?.id ?? null,
            permissionOverwrites: permOverwrites,
            topic: `Ticket #${number} de ${user.username} — ${reason}`,
        });
    } catch (err) {
        const msg = '❌ No pude crear el canal del ticket. ¿Tengo permisos de **Gestionar Canales**?';
        if (ctx) return ctx.reply({ content: msg, ephemeral: true });
        return { error: msg };
    }

    // Save to DB
    const ticket = await Ticket.create({
        guildId:   guild.id,
        channelId: channel.id,
        userId:    user.id,
        reason,
        number,
        status: 'open',
    });

    // Welcome embed in ticket channel
    const closeRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('ticket_close')
            .setLabel('🔒 Cerrar ticket')
            .setStyle(ButtonStyle.Danger)
    );

    const embed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle(`🎫 Ticket #${number}`)
        .setDescription(
            `Hola <@${user.id}>, gracias por abrir un ticket.\nUn miembro del equipo te atenderá en breve.\n\n**Motivo:** ${reason}`
        )
        .setFooter({ text: 'Usa /ticket close o el botón para cerrar.' })
        .setTimestamp();

    await channel.send({ content: `<@${user.id}>`, embeds: [embed], components: [closeRow] });

    // Log
    if (guildConfig.ticketLogChannel) {
        const logCh = guild.channels.cache.get(guildConfig.ticketLogChannel);
        if (logCh?.isTextBased()) {
            await logCh.send({
                embeds: [new EmbedBuilder()
                    .setColor('Blue')
                    .setTitle('📋 Ticket abierto')
                    .addFields(
                        { name: '🔢 Ticket', value: `#${number}`,                            inline: true },
                        { name: '👤 Usuario', value: `${user.username} (${user.id})`,        inline: true },
                        { name: '📝 Motivo',  value: reason,                                 inline: false },
                        { name: '📢 Canal',   value: `<#${channel.id}>`,                    inline: true },
                    )
                    .setTimestamp()],
            }).catch(() => {});
        }
    }

    if (ctx) return ctx.reply({ content: `✅ Ticket creado: <#${channel.id}>`, ephemeral: true });
    return { channel, ticket };
}

async function closeTicket(client, guild, channel, ticket, closedBy, reason, ctx = null) {
    // Build transcript
    const transcript = buildTranscript(ticket);

    ticket.status   = 'closed';
    ticket.closedAt = new Date();
    await ticket.save();

    const embed = new EmbedBuilder()
        .setColor('Red')
        .setTitle(`🔒 Ticket #${ticket.number} cerrado`)
        .addFields(
            { name: '👤 Abierto por', value: `<@${ticket.userId}>`,      inline: true },
            { name: '🔒 Cerrado por', value: `<@${closedBy.id}>`,        inline: true },
            { name: '📝 Razón',       value: reason,                     inline: false },
        )
        .setTimestamp();

    // Notify in ticket channel
    await channel.send({ embeds: [embed] }).catch(() => {});

    // Send transcript to log channel
    const guildConfig = await GuildConfig.findOne({ guildId: guild.id });
    if (guildConfig?.ticketLogChannel) {
        const logCh = guild.channels.cache.get(guildConfig.ticketLogChannel);
        if (logCh?.isTextBased()) {
            const transcriptContent = transcript.length > 1900
                ? transcript.slice(0, 1900) + '\n…(truncado)'
                : transcript;
            await logCh.send({
                embeds: [embed],
                files: transcript
                    ? [{ attachment: Buffer.from(transcript, 'utf-8'), name: `ticket-${ticket.number}.txt` }]
                    : [],
            }).catch(() => {});
        }
    }

    // Delete channel after 5 seconds
    setTimeout(() => channel.delete().catch(() => {}), 5000);

    if (ctx) {
        if (ctx.isSlash) {
            return ctx.reply({ content: '🔒 Cerrando el ticket…', ephemeral: true }).catch(() => {});
        }
    }
}

module.exports.openTicket  = openTicket;
module.exports.closeTicket = closeTicket;
