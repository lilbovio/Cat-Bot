const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

// Carga todos los comandos bajo `dir` (recursivo) en client.commands.
// Los aliases se guardan en client.aliases (alias -> nombre canónico).
function loadCommands(client, dir) {
    const absDir = path.resolve(dir);
    const entries = fs.readdirSync(absDir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(absDir, entry.name);
        if (entry.isDirectory()) {
            loadCommands(client, fullPath);
            continue;
        }
        if (!entry.name.endsWith('.js')) continue;

        let command;
        try {
            command = require(fullPath);
        } catch (error) {
            logger.error(`Error al cargar ${fullPath}:`, error.message);
            continue;
        }

        if (!command || !command.name || typeof command.execute !== 'function') {
            logger.warn(`Comando inválido ignorado: ${fullPath}`);
            continue;
        }

        command.category = command.category || path.basename(absDir);
        command.filePath = fullPath;

        client.commands.set(command.name, command);
        if (command.data) client.slashCommands.set(command.name, command);
        for (const alias of command.aliases || []) {
            client.aliases.set(alias, command.name);
        }
    }
}

module.exports = { loadCommands };
