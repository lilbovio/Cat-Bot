const { SlashCommandBuilder } = require('discord.js');
const figlet = require('figlet');

module.exports = {
    name: 'ascii',
    description: 'Convierte texto a arte ASCII.',
    category: 'fun',
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('ascii')
        .setDescription('Convierte texto a arte ASCII.')
        .addStringOption((o) =>
            o.setName('texto').setDescription('Texto a convertir (máx. 20 caracteres).').setRequired(true)
        ),
    async execute(ctx) {
        const texto = ctx.getString('texto')?.slice(0, 20);
        if (!texto) return ctx.reply({ content: '❌ Debes escribir un texto.', ephemeral: true });

        figlet(texto, (err, result) => {
            if (err || !result) return ctx.reply({ content: '❌ Error al generar el arte ASCII.', ephemeral: true });
            const output = result.slice(0, 1900); // límite de Discord
            ctx.reply(`\`\`\`\n${output}\n\`\`\``);
        });
    },
};
