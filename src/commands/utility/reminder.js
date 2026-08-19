const { SlashCommandBuilder } = require('discord.js');
const { parseDuration, formatDuration } = require('../../utils/format');

module.exports = {
    name: 'reminder',
    description: 'Crea un recordatorio que te envía un DM después de cierto tiempo.',
    category: 'utility',
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('reminder')
        .setDescription('Crea un recordatorio que te envía un DM.')
        .addStringOption((o) =>
            o.setName('tiempo').setDescription('Cuándo recordarte (ej: 10m, 1h, 2h30m — máx: 24h).').setRequired(true)
        )
        .addStringOption((o) =>
            o.setName('mensaje').setDescription('Qué quieres que te recuerde.').setRequired(true)
        ),
    async execute(ctx) {
        const raw     = ctx.getString('tiempo');
        const mensaje = ctx.getString('mensaje');

        // Soportar formato compuesto como "2h30m"
        let ms = 0;
        const partes = raw.match(/(\d+)(d|h|m|s)/gi) || [];
        for (const p of partes) {
            const m = p.match(/^(\d+)(d|h|m|s)$/i);
            if (m) {
                const val = parseInt(m[1], 10);
                const unit = m[2].toLowerCase();
                if (unit === 'd') ms += val * 86400000;
                else if (unit === 'h') ms += val * 3600000;
                else if (unit === 'm') ms += val * 60000;
                else if (unit === 's') ms += val * 1000;
            }
        }
        if (!ms) ms = parseDuration(raw);
        if (!ms || ms <= 0)
            return ctx.reply({ content: '❌ Tiempo inválido. Usa `10m`, `1h`, `2h30m`, etc.', ephemeral: true });

        const MAX = 24 * 60 * 60 * 1000;
        if (ms > MAX)
            return ctx.reply({ content: '❌ El tiempo máximo es 24 horas.', ephemeral: true });

        await ctx.reply({ content: `⏰ Recordatorio creado. Te avisaré en **${formatDuration(ms)}**.`, ephemeral: true });

        setTimeout(async () => {
            try {
                await ctx.user.send(`⏰ **Recordatorio de CatBot:**\n> ${mensaje}`);
            } catch {
                ctx.send(`⏰ ${ctx.user}, recordatorio: **${mensaje}** *(no pude enviarte DM)*`);
            }
        }, ms);
    },
};
