const { REST, Routes } = require('discord.js');
const config = require('../../config');
const logger = require('../utils/logger');

// Registra los comandos slash en todos los servidores donde está el bot.
// El registro por guild es instantáneo (vs global que tarda hasta 1h).
async function registerSlashCommands(client) {
    const slashCommands = [...client.slashCommands.values()]
        .filter((cmd) => cmd.data)
        .map((cmd) => cmd.data.toJSON());

    if (slashCommands.length === 0) {
        logger.warn('No hay comandos slash para registrar.');
        return;
    }

    const rest = new REST({ version: '10' }).setToken(config.token);
    const guilds = client.guilds.cache;

    if (guilds.size === 0) {
        // Si el cliente todavía no tiene guilds cacheados (arranque muy rápido),
        // caemos en registro global como respaldo.
        try {
            await rest.put(Routes.applicationCommands(config.clientId), { body: slashCommands });
            logger.info(`✅ ${slashCommands.length} comandos registrados globalmente.`);
        } catch (err) {
            logger.error('Error registrando comandos globales:', err);
        }
        return;
    }

    let ok = 0;
    let fail = 0;
    for (const [guildId] of guilds) {
        try {
            await rest.put(Routes.applicationGuildCommands(config.clientId, guildId), { body: slashCommands });
            ok++;
        } catch {
            fail++;
        }
    }
    logger.info(`✅ ${slashCommands.length} comandos registrados en ${ok}/${guilds.size} servidores.${fail > 0 ? ` (${fail} fallaron)` : ''}`);
}

module.exports = { registerSlashCommands };
