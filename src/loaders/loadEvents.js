const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

// Carga los eventos de `dir`. Cada evento exporta { name, once?, execute(client, ...args) }.
function loadEvents(client, dir) {
    const absDir = path.resolve(dir);
    const files = fs.readdirSync(absDir).filter((file) => file.endsWith('.js'));
    for (const file of files) {
        let event;
        try {
            event = require(path.join(absDir, file));
        } catch (error) {
            logger.error(`Error al cargar el evento ${file}:`, error.message);
            continue;
        }

        if (!event || !event.name || typeof event.execute !== 'function') {
            logger.warn(`Evento inválido ignorado: ${file}`);
            continue;
        }

        const handler = (...args) => event.execute(client, ...args);
        if (event.once) {
            client.once(event.name, handler);
        } else {
            client.on(event.name, handler);
        }
    }
}

module.exports = { loadEvents };
