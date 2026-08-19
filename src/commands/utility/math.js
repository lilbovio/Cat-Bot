const { SlashCommandBuilder } = require('discord.js');
const { evaluate } = require('mathjs');

module.exports = {
    name: 'math',
    description: 'Resuelve una operación matemática.',
    category: 'utility',
    cooldown: 3,
    data: new SlashCommandBuilder()
        .setName('math')
        .setDescription('Resuelve una operación matemática.')
        .addStringOption((o) =>
            o.setName('operacion').setDescription('La operación a resolver (ej: 2+2, sqrt(16)).').setRequired(true)
        ),
    async execute(ctx) {
        const operation = ctx.getString('operacion');
        if (!operation) return ctx.reply({ content: 'Por favor, proporciona una operación.', ephemeral: true });
        try {
            const result = evaluate(operation);
            await ctx.reply(`🧮 \`${operation}\` = **${result}**`);
        } catch {
            await ctx.reply({ content: '❌ Operación inválida. Verifica tu entrada.', ephemeral: true });
        }
    },
};
