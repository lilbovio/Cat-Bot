const UserLevel = require('../../models/UserLevel');
const GuildConfig = require('../../models/GuildConfig');
const { EmbedBuilder } = require('discord.js');

// XP aleatorio por mensaje: 15–40 (mismo rango que MEE6)
const XP_MIN = 15;
const XP_MAX = 40;
const XP_COOLDOWN_MS = 60_000; // 1 minuto anti-spam entre ganancias de XP

const lastXp = new Map(); // key: `${guildId}:${userId}`

/**
 * XP necesario para pasar del nivel `n` al nivel `n+1`.
 * Fórmula idéntica a MEE6: 5n² + 50n + 100
 */
function xpForLevel(n) {
    return 5 * n * n + 50 * n + 100;
}

/**
 * Calcula el nivel que corresponde a un total de XP acumulado,
 * y cuánto XP lleva el usuario dentro de ese nivel.
 *
 * @param {number} totalXp  XP total acumulado en el servidor
 * @returns {{ level: number, currentXp: number, neededXp: number }}
 */
function computeLevel(totalXp) {
    let level = 0;
    let remaining = totalXp;
    while (remaining >= xpForLevel(level)) {
        remaining -= xpForLevel(level);
        level++;
    }
    return { level, currentXp: remaining, neededXp: xpForLevel(level) };
}

async function handleLeveling(message) {
    if (!message.guild || message.author.bot) return;

    // Respect levelingEnabled; treat missing config as "enabled" (default: true)
    const guildConfig = await GuildConfig.findOne({ guildId: message.guild.id });
    if (guildConfig && guildConfig.levelingEnabled === false) return;

    const key = `${message.guild.id}:${message.author.id}`;
    const now = Date.now();
    if (lastXp.has(key) && now - lastXp.get(key) < XP_COOLDOWN_MS) return;
    lastXp.set(key, now);

    const gainedXp = Math.floor(Math.random() * (XP_MAX - XP_MIN + 1)) + XP_MIN;

    // Increment XP and message count atomically
    const userData = await UserLevel.findOneAndUpdate(
        { guildId: message.guild.id, userId: message.author.id },
        { $inc: { xp: gainedXp, messages: 1 } },
        { new: true, upsert: true }
    );

    // Derive the correct level from total XP (source of truth)
    const { level: newLevel } = computeLevel(userData.xp);

    if (newLevel > userData.level) {
        // Persist new level
        await UserLevel.updateOne(
            { guildId: message.guild.id, userId: message.author.id },
            { $set: { level: newLevel } }
        );

        const embed = new EmbedBuilder()
            .setColor('Gold')
            .setTitle('🎉 ¡Subiste de nivel!')
            .setDescription(`¡Felicidades ${message.author}! Has alcanzado el **nivel ${newLevel}**.`)
            .setThumbnail(message.author.displayAvatarURL())
            .setFooter({ text: `XP total: ${userData.xp}` })
            .setTimestamp();

        message.reply({ embeds: [embed] }).catch(() => {});
    }
}

module.exports = { handleLeveling, xpForLevel, computeLevel };
