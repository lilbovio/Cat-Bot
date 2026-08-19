const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Economy = require('../../../models/Economy');

const DAILY_BASE    = parseInt(process.env.DAILY_AMOUNT, 10) || 100;
const STREAK_BONUS  = 10;   // +10 coins per consecutive day
const STREAK_MAX    = 50;   // max bonus coins
const COOLDOWN_MS   = 20 * 60 * 60 * 1000; // 20h (lenient: same-day timezone difference)

module.exports = {
    name: 'daily',
    description: 'Recoge tus monedas diarias. La racha aumenta el bono.',
    category: 'utility',
    cooldown: 3,
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Recoge tus monedas diarias. La racha aumenta el bono.'),

    async execute(ctx) {
        const now     = Date.now();
        let   economy = await Economy.findOne({ guildId: ctx.guild.id, userId: ctx.user.id });

        if (!economy) {
            economy = new Economy({ guildId: ctx.guild.id, userId: ctx.user.id });
        }

        // Cooldown check
        if (economy.lastDaily) {
            const elapsed = now - economy.lastDaily.getTime();
            if (elapsed < COOLDOWN_MS) {
                const remaining = COOLDOWN_MS - elapsed;
                const hrs  = Math.floor(remaining / 3600000);
                const mins = Math.floor((remaining % 3600000) / 60000);
                return ctx.reply({
                    content: `⏳ Ya recogiste tus monedas hoy. Vuelve en **${hrs}h ${mins}m**.`,
                    ephemeral: true,
                });
            }

            // Check streak: last claim within 44h = streak maintained, else reset
            const streakWindow = 44 * 60 * 60 * 1000;
            if (elapsed > streakWindow) {
                economy.streak = 0;
            }
        }

        economy.streak = (economy.streak || 0) + 1;
        const bonus    = Math.min(economy.streak * STREAK_BONUS, STREAK_MAX);
        const earned   = DAILY_BASE + bonus;
        economy.balance   = (economy.balance || 0) + earned;
        economy.lastDaily = new Date(now);
        await economy.save();

        const embed = new EmbedBuilder()
            .setColor('Gold')
            .setTitle('💰 ¡Monedas diarias recogidas!')
            .addFields(
                { name: '🪙 Ganadas hoy',      value: `**${earned}** monedas (base ${DAILY_BASE} + bono racha ${bonus})`, inline: false },
                { name: '🔥 Racha actual',      value: `**${economy.streak}** día${economy.streak !== 1 ? 's' : ''}`,       inline: true  },
                { name: '💳 Saldo total',        value: `**${economy.balance.toLocaleString()}** monedas`,                    inline: true  },
            )
            .setFooter({ text: 'Vuelve en 20 horas para mantener la racha.' })
            .setTimestamp();

        return ctx.reply({ embeds: [embed] });
    },
};
