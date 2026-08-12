const { Events } = require('discord.js');
const UserLevel = require('../models/UserLevel');
const GuildConfig = require('../models/GuildConfig');

const LEVEL_MESSAGES = 10; // Número de mensajes necesarios para subir de nivel

async function handleLeveling(message) {
    if (!message.guild || message.author.bot) return;

    const guildConfig = await GuildConfig.findOne({ guildId: message.guild.id });
    if (!guildConfig || !guildConfig.levelingEnabled) return; // Verifica si el sistema está activado

    const user = await UserLevel.findOneAndUpdate(
        { guildId: message.guild.id, userId: message.author.id },
        { $inc: { messages: 1 } },
        { new: true, upsert: true }
    );

    const newLevel = Math.floor(user.messages / LEVEL_MESSAGES);
    if (newLevel > user.level) {
        user.level = newLevel;
        await user.save();

        // Responde al mensaje felicitando al usuario
        message.reply(`¡Felicidades ${message.author}! Acabas de subir al nivel ${user.level}.`);
    }
}

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        await handleLeveling(message);
    },
};
