const { Events } = require('discord.js');
const config = require('../../config');
const CommandContext = require('../CommandContext');
const Blacklist = require('../../models/Blacklist');
const Ticket = require('../../models/Ticket');
const { hasPermissions, isOwner } = require('../utils/permissions');
const cooldowns = require('../utils/cooldowns');
const logger = require('../utils/logger');

module.exports = {
    name: Events.InteractionCreate,
    async execute(client, interaction) {

        // ── Button interactions ───────────────────────────────────────────────
        if (interaction.isButton()) {
            const { customId } = interaction;

            // Ticket: open via panel button
            if (customId === 'ticket_open') {
                const { openTicket } = require('../commands/utility/ticket');
                await interaction.deferReply({ ephemeral: true });
                await openTicket(client, interaction.guild, interaction.user, 'Sin motivo especificado');
                return interaction.editReply({ content: '✅ Tu ticket ha sido creado.' }).catch(() => {});
            }

            // Ticket: close via button inside ticket channel
            if (customId === 'ticket_close') {
                const { closeTicket } = require('../commands/utility/ticket');
                const ticket = await Ticket.findOne({ channelId: interaction.channel.id, status: 'open' });
                if (!ticket) {
                    return interaction.reply({ content: '❌ Este canal no es un ticket abierto.', ephemeral: true });
                }
                await interaction.reply({ content: '🔒 Cerrando el ticket…', ephemeral: true }).catch(() => {});
                return closeTicket(client, interaction.guild, interaction.channel, ticket, interaction.user, 'Cerrado con botón');
            }

            return; // unhandled button
        }

        // ── Select menu interactions ──────────────────────────────────────────
        if (interaction.isStringSelectMenu()) {
            // Handled inside the command collector (help, etc.) — nothing to do globally
            return;
        }

        // ── Slash command interactions ────────────────────────────────────────
        if (!interaction.isChatInputCommand()) return;

        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        // Blacklist check (owner is always exempt)
        const blacklisted = await Blacklist.findOne({ userID: interaction.user.id });
        if (blacklisted && !isOwner(interaction.user.id)) {
            return interaction.reply({
                content: 'No tienes permiso para usar este bot porque estás en la blacklist.',
                ephemeral: true,
            });
        }

        // Solo el creador
        if (command.ownerOnly && !isOwner(interaction.user.id)) {
            return interaction.reply({
                content: 'Este comando solo puede usarlo el creador del bot.',
                ephemeral: true,
            });
        }

        // Permisos
        if (!hasPermissions(interaction.member, command.permissions)) {
            return interaction.reply({
                content: 'No tienes permisos para usar este comando.',
                ephemeral: true,
            });
        }

        // Cooldown
        const remaining = cooldowns.getRemaining(interaction.user.id, command);
        if (remaining > 0) {
            return interaction.reply({
                content: `Espera ${(remaining / 1000).toFixed(1)}s para usar este comando de nuevo.`,
                ephemeral: true,
            });
        }
        cooldowns.start(interaction.user.id, command);

        const ctx = new CommandContext({ client, source: interaction, command, args: [] });
        try {
            await command.execute(ctx);
        } catch (error) {
            logger.error(`Error ejecutando el comando "${command.name}":`, error);
            if (interaction.replied || interaction.deferred) {
                await interaction
                    .followUp({ content: 'Hubo un error ejecutando el comando.', ephemeral: true })
                    .catch(() => {});
            } else {
                await interaction
                    .reply({ content: 'Hubo un error ejecutando el comando.', ephemeral: true })
                    .catch(() => {});
            }
        }
    },
};
