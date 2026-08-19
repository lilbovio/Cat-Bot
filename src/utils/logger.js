const LEVELS = { INFO: '\x1b[36mINFO\x1b[0m', WARN: '\x1b[33mWARN\x1b[0m', ERROR: '\x1b[31mERROR\x1b[0m' };

function ts() {
    return new Date().toLocaleTimeString('es-ES', { hour12: false });
}

module.exports = {
    info:  (...args) => console.log(`[${ts()}] ${LEVELS.INFO} `, ...args),
    warn:  (...args) => console.warn(`[${ts()}] ${LEVELS.WARN} `, ...args),
    error: (...args) => console.error(`[${ts()}] ${LEVELS.ERROR}`, ...args),
};
