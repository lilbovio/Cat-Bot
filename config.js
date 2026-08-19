require('dotenv').config();

const required = ['TOKEN', 'CLIENT_ID', 'ADMIN_ID', 'MONGO_URI'];
for (const key of required) {
    if (!process.env[key]) {
        console.warn(`⚠️  Falta la variable de entorno ${key} en el archivo .env`);
    }
}

module.exports = {
    token: process.env.TOKEN,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    adminID: process.env.ADMIN_ID,
    mongoUri: process.env.MONGO_URI,
    supportInvite: process.env.SUPPORT_INVITE || 'https://discord.gg/6cKEZF3G5P',
    dashboard: {
        port: parseInt(process.env.DASHBOARD_PORT, 10) || 3001,
        url: process.env.DASHBOARD_URL || 'http://localhost:3001',
        sessionSecret: process.env.SESSION_SECRET || 'catbot_session_secret_change_me',
    },
    channels: {
        startup: process.env.STARTUP_CHANNEL || '907842163130392646',
        guildLog: process.env.GUILD_LOG_CHANNEL || '907842367086796851',
        error: process.env.ERROR_CHANNEL || '1321757359277867038',
        complaint: process.env.COMPLAINT_CHANNEL || '1321758906644566078',
        blacklistLog: process.env.BLACKLIST_LOG_CHANNEL || '1326122014573989970',
    },
};
