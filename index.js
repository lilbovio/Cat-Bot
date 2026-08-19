const { Client, GatewayIntentBits, Collection } = require('discord.js');
const path = require('path');
const config = require('./config');
const mongoose = require('mongoose');
const { loadCommands } = require('./src/loaders/loadCommands');
const { loadEvents } = require('./src/loaders/loadEvents');
const { registerSlashCommands } = require('./src/loaders/registerSlashCommands');
const { startDashboard } = require('./dashboard/server');
const logger = require('./src/utils/logger');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildModeration,       // bans
        GatewayIntentBits.GuildVoiceStates,       // voice join/leave
        GatewayIntentBits.GuildMessageReactions,  // reactions (future)
        GatewayIntentBits.GuildInvites,           // invites
        GatewayIntentBits.GuildEmojisAndStickers, // emoji changes
        GatewayIntentBits.GuildPresences,         // presence (online status)
    ],
});

client.commands = new Collection();
client.slashCommands = new Collection();
client.aliases = new Collection();

// ── Bootstrap ────────────────────────────────────────────────────────────────

async function connectMongo(retries = 5, delayMs = 3000) {
    for (let i = 1; i <= retries; i++) {
        try {
            await mongoose.connect(config.mongoUri);
            logger.info('✅ Conectado a MongoDB');
            return;
        } catch (err) {
            logger.warn(`⚠️  MongoDB intento ${i}/${retries} fallido: ${err.message}`);
            if (i < retries) await new Promise((r) => setTimeout(r, delayMs));
        }
    }
    logger.error('❌ No se pudo conectar a MongoDB tras varios intentos. El bot sigue sin base de datos.');
}

(async () => {
    // MongoDB con reintentos automáticos
    await connectMongo();

    // Comandos y eventos (rutas absolutas para evitar problemas en Windows)
    loadCommands(client, path.join(__dirname, 'src', 'commands'));
    loadEvents(client, path.join(__dirname, 'src', 'events'));
    logger.info(`📦 ${client.commands.size} comandos cargados | ${client.slashCommands.size} con slash`);

    // Handlers globales
    process.on('unhandledRejection', (reason) => logger.error('Unhandled Rejection:', reason));
    process.on('uncaughtException', (err) => logger.error('Uncaught Exception:', err));

    // Iniciar dashboard web (pasa el client para que la API pueda consultar guilds/miembros)
    startDashboard(client);

    // Login — los slash commands se registran tras el evento ready (en ready.js)
    await client.login(config.token);
})();
