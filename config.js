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
    adminID: process.env.ADMIN_ID,
    mongoUri: process.env.MONGO_URI,
};
