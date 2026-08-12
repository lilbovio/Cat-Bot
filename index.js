const fs = require('fs');
const { Client, Collection, GatewayIntentBits, REST, Routes } = require('discord.js');
const config = require('./config'); // Carga token, clientId, adminID y mongoUri desde el .env
const mongoose = require('mongoose');
const GuildConfig = require('./models/GuildConfig'); // Modelo para configuración de servidores
const Blacklist = require('./models/Blacklist'); // Modelo de blacklist
const handlerFiles = fs.readdirSync('./handlers').filter(file => file.endsWith('.js')); // Manejadores de eventos

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// Colecciones para comandos
client.commands = new Collection();
client.slashCommands = new Collection();

// Ejecutar manejadores de eventos
// Un handler puede ser una función (client) => {...} o un objeto { name, execute }
for (const file of handlerFiles) {
    const handler = require(`./handlers/${file}`);
    if (typeof handler === 'function') {
        handler(client); // Ejecutar cada handler pasando el cliente
        console.log(`Handler ${file} cargado.`);
    } else if (handler && typeof handler.execute === 'function') {
        client.on(handler.name, handler.execute); // Registrar como evento
        console.log(`Handler ${file} registrado como evento ${handler.name}.`);
    } else {
        console.error(`El handler ${file} no tiene una forma válida.`);
    }
}

// Conexión a MongoDB
mongoose
    .connect(config.mongoUri)
    .then(() => {
        console.log('Conectado a MongoDB');
    })
    .catch((err) => {
        console.error('Error al conectar a MongoDB:', err);
    });

// Leer comandos con prefijo desde la carpeta "commands"
const commandFiles = fs.readdirSync('./commands').filter((file) => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

// Leer comandos slash desde la carpeta "slash_commands"
const slashCommandFiles = fs.readdirSync('./slash_commands').filter((file) => file.endsWith('.js'));
const slashCommands = [];

for (const file of slashCommandFiles) {
    const command = require(`./slash_commands/${file}`);
    client.slashCommands.set(command.data.name, command);
    slashCommands.push(command.data.toJSON());
}

// Registrar Slash Commands globalmente
const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
    try {
        console.log('Actualizando los comandos slash...');
        await rest.put(Routes.applicationCommands(config.clientId), { body: slashCommands });
        console.log('¡Comandos de slash registrados con éxito!');
    } catch (error) {
        console.error('Error registrando los slash commands:', error);
    }
})();

// Manejo de mensajes (comandos con prefijo)
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;

    // Obtener prefijo del servidor desde MongoDB
    const guildConfig = await GuildConfig.findOne({ guildId: message.guild.id });
    const prefix = guildConfig?.prefix || '!';

    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/\s+/);
    const commandName = args.shift().toLowerCase();

    // Buscar comando en ambas colecciones
    const command = client.commands.get(commandName) || client.slashCommands.get(commandName);
    if (!command) return;

    // Verificar si el usuario está en la blacklist
    const blacklistedUser = await Blacklist.findOne({ userID: message.author.id });

    if (blacklistedUser) {
        return message.reply('No tienes permiso para usar este bot porque estás en la blacklist.');
    }

    try {
        await command.execute(message, args, client); // Ejecutar comando híbrido
    } catch (error) {
        console.error(error);
        message.reply('Hubo un error al ejecutar ese comando.');
    }
});

// Manejo de interacciones (slash commands)
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.slashCommands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction, null, client); // Ejecutar slash command
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'Hubo un error ejecutando el comando.', ephemeral: true }).catch(() => {});
        } else {
            await interaction.reply({ content: 'Hubo un error ejecutando el comando.', ephemeral: true });
        }
    }
});

// Depuración de errores globales
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception thrown:', err);
});

// Inicia sesión en Discord
client.login(config.token);
