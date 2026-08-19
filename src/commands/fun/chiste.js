const { SlashCommandBuilder } = require('discord.js');

const CHISTES = [
    '¿Qué hace una abeja en el gimnasio? ¡Zum-ba!',
    '¿Por qué los pájaros no usan WhatsApp? Porque ya tienen Twitter.',
    '¿Qué le dice una impresora a otra? ¡Esa hoja es tuya o es una impresión mía!',
    '¿Cuál es el colmo de un electricista? Que su esposa se llame Luz y sus hijas le sigan la corriente.',
    '¿Qué le dice un techo a otro? ¡Techo de menos!',
    '¿Cómo se llama el campeón de buceo de Japón? Tokofondo. ¿Y el subcampeón? Kasitokofondo.',
];

module.exports = {
    name: 'chiste',
    description: 'Cuenta un chiste al azar.',
    category: 'fun',
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('chiste')
        .setDescription('Cuenta un chiste al azar.'),
    async execute(ctx) {
        const chiste = CHISTES[Math.floor(Math.random() * CHISTES.length)];
        await ctx.reply(`😂 ${chiste}`);
    },
};
