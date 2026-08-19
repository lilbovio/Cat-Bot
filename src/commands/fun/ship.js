const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    name: 'ship',
    description: 'Combina los nombres de dos usuarios y muestra su compatibilidad.',
    category: 'fun',
    cooldown: 3,
    data: new SlashCommandBuilder()
        .setName('ship')
        .setDescription('Combina los nombres de dos usuarios y muestra su compatibilidad.')
        .addUserOption((o) => o.setName('usuario1').setDescription('Primer usuario').setRequired(true))
        .addUserOption((o) => o.setName('usuario2').setDescription('Segundo usuario').setRequired(true)),
    async execute(ctx) {
        const u1 = await ctx.getUser('usuario1');
        const u2 = await ctx.getUser('usuario2');
        if (!u1 || !u2) return ctx.reply({ content: '❌ No se encontraron ambos usuarios.', ephemeral: true });

        const n1 = u1.username.slice(0, Math.ceil(u1.username.length / 2));
        const n2 = u2.username.slice(Math.floor(u2.username.length / 2));
        const shipName = n1 + n2;
        const pct = Math.floor(Math.random() * 101);

        const bar = '█'.repeat(Math.floor(pct / 10)) + '░'.repeat(10 - Math.floor(pct / 10));
        let emoji = pct >= 80 ? '💖' : pct >= 50 ? '💛' : pct >= 30 ? '🤍' : '💔';

        await ctx.reply(
            `💘 **Ship:** ${u1} + ${u2} = **${shipName}**\n` +
            `${emoji} Compatibilidad: **${pct}%**\n\`[${bar}]\``
        );
    },
};
