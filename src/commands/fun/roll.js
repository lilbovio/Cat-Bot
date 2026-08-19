const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    name: 'roll',
    description: 'Lanza dados con notación XdY (ej: 2d6, d20, 3d8).',
    category: 'fun',
    cooldown: 3,
    data: new SlashCommandBuilder()
        .setName('roll')
        .setDescription('Lanza dados con notación XdY (ej: 2d6, d20, 3d8).')
        .addStringOption((o) =>
            o.setName('dado').setDescription('Notación de dados: XdY — ej: 2d6, d20').setRequired(false)
        ),
    async execute(ctx) {
        const input = (ctx.getString('dado') || 'd6').toLowerCase().trim();
        const match = input.match(/^(\d*)d(\d+)$/);
        if (!match) {
            return ctx.reply({ content: '❌ Formato inválido. Usa `XdY` (ej: `2d6`, `d20`).', ephemeral: true });
        }
        const cantidad = Math.min(parseInt(match[1] || '1', 10), 20);
        const caras   = Math.min(parseInt(match[2], 10), 1000);
        if (caras < 2) return ctx.reply({ content: '❌ El dado debe tener al menos 2 caras.', ephemeral: true });

        const resultados = Array.from({ length: cantidad }, () => Math.floor(Math.random() * caras) + 1);
        const total = resultados.reduce((a, b) => a + b, 0);

        await ctx.reply(
            `🎲 **${cantidad}d${caras}** → ${resultados.join(' + ')} = **${total}**`
        );
    },
};
