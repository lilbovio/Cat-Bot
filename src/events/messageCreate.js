const { Events } = require('discord.js');
const config = require('../../config');
const GuildConfig = require('../../models/GuildConfig');
const Blacklist = require('../../models/Blacklist');
const CommandContext = require('../CommandContext');
const { handleAfk } = require('../services/afk');
const { handleLeveling } = require('../services/leveling');
const { handleAutomod } = require('../services/automod');
const { hasPermissions, isOwner } = require('../utils/permissions');
const cooldowns = require('../utils/cooldowns');
const logger = require('../utils/logger');

module.exports = {
    name: Events.MessageCreate,
    async execute(client, message) {
        if (message.author.bot || !message.guild) return;

        // Sistemas pasivos: AFK, nivelación y automod
        await handleAfk(message);
        await handleLeveling(message);
        await handleAutomod(message);

        // Resolución de comandos con prefijo
        const guildConfig = await GuildConfig.findOne({ guildId: message.guild.id });
        const prefix = guildConfig?.prefix || '!';
        if (!message.content.startsWith(prefix)) return;

        const args = message.content.slice(prefix.length).trim().split(/\s+/);
        const commandName = args.shift().toLowerCase();

        const command = client.commands.get(commandName) || client.commands.get(client.aliases.get(commandName));
        if (!command) return;

        // Blacklist (el creador siempre puede usar el bot)
        const blacklisted = await Blacklist.findOne({ userID: message.author.id });
        if (blacklisted && !isOwner(message.author.id)) {
            return message.reply('No tienes permiso para usar este bot porque estás en la blacklist.');
        }

        // Solo el creador
        if (command.ownerOnly && !isOwner(message.author.id)) {
            return message.reply('Este comando solo puede usarlo el creador del bot.');
        }

        // Permisos
        if (!hasPermissions(message.member, command.permissions)) {
            return message.reply('No tienes permisos para usar este comando.');
        }

        // Cooldown
        const remaining = cooldowns.getRemaining(message.author.id, command);
        if (remaining > 0) {
            return message.reply(`Espera ${(remaining / 1000).toFixed(1)}s para usar este comando de nuevo.`);
        }
        cooldowns.start(message.author.id, command);

        const ctx = new CommandContext({ client, source: message, command, args });
        try {
            await command.execute(ctx);
        } catch (error) {
            logger.error(`Error ejecutando el comando "${command.name}":`, error);
            message.reply('Hubo un error al ejecutar ese comando.').catch(() => {});
        }
    },
};
