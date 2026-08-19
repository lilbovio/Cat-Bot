const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const UserLevel = require('../../../models/UserLevel');
const GuildConfig = require('../../../models/GuildConfig');
const { computeLevel } = require('../../services/leveling');

// Render a simple ASCII progress bar
function progressBar(current, required, length = 14) {
    const pct    = required > 0 ? current / required : 0;
    const filled = Math.round(pct * length);
    const empty  = length - filled;
    return `[${'█'.repeat(filled)}${'░'.repeat(empty)}]`;
}

// Safe display name compatible with both cached and API users
function displayTag(user) {
    // Discord.js v14: pomelo users have discriminator "0"
    return user.discriminator && user.discriminator !== '0'
        ? `${user.username}#${user.discriminator}`
        : user.username;
}

module.exports = {
    name: 'rank',
    description: 'Muestra el nivel y XP de un usuario en este servidor.',
    category: 'utility',
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('Muestra el nivel y XP de un usuario en este servidor.')
        .addUserOption((o) =>
            o.setName('usuario').setDescription('Usuario a consultar (por defecto: tú).').setRequired(false)
        ),
    async execute(ctx) {
        const target = (await ctx.getUser('usuario')) || ctx.user;

        // Treat missing config as leveling enabled (default)
        const guildConfig = await GuildConfig.findOne({ guildId: ctx.guild.id });
        if (guildConfig && guildConfig.levelingEnabled === false) {
            return ctx.reply({ content: '❌ El sistema de nivelación está desactivado en este servidor.', ephemeral: true });
        }

        const userData = await UserLevel.findOne({ guildId: ctx.guild.id, userId: target.id });
        if (!userData || userData.xp === 0) {
            return ctx.reply({
                content: `❌ **${displayTag(target)}** aún no tiene XP en este servidor.`,
                ephemeral: true,
            });
        }

        const totalXp  = userData.xp;
        const messages = userData.messages;

        // Derive level/progress directly from total XP (consistent with service)
        const { level, currentXp, neededXp } = computeLevel(totalXp);

        // Sync stored level if it's stale (e.g. after a restart-level)
        if (level !== userData.level) {
            await UserLevel.updateOne(
                { guildId: ctx.guild.id, userId: target.id },
                { $set: { level } }
            );
        }

        // Server rank position (sorted by xp desc)
        const allUsers = await UserLevel.find({ guildId: ctx.guild.id }).sort({ xp: -1 });
        const rankPos  = allUsers.findIndex((u) => u.userId === target.id) + 1;

        const bar = progressBar(currentXp, neededXp);
        const pct = neededXp > 0 ? Math.floor((currentXp / neededXp) * 100) : 100;

        const embed = new EmbedBuilder()
            .setColor('Blue')
            .setAuthor({ name: displayTag(target), iconURL: target.displayAvatarURL() })
            .setTitle(`📊 Rango en ${ctx.guild.name}`)
            .addFields(
                { name: '🏆 Rango',    value: `#${rankPos} de ${allUsers.length}`, inline: true },
                { name: '⭐ Nivel',    value: `${level}`,                          inline: true },
                { name: '💬 Mensajes', value: `${messages}`,                       inline: true },
                {
                    name: `✨ XP en nivel — ${currentXp} / ${neededXp}`,
                    value: `${bar}  ${pct}%`,
                    inline: false,
                },
                { name: '🔢 XP Total', value: `${totalXp.toLocaleString()}`, inline: true },
                { name: '⬆️ Siguiente nivel a', value: `${totalXp + (neededXp - currentXp)} XP`, inline: true },
            )
            .setThumbnail(target.displayAvatarURL({ size: 256 }))
            .setTimestamp();

        await ctx.reply({ embeds: [embed] });
    },
};
