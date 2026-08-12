const jokes = [
    "¿Qué hace una abeja en el gimnasio? ¡Zum-ba!",
    "¿Por qué los pájaros no usan WhatsApp? Porque ya tienen Twitter.",
    "¿Qué le dice una impresora a otra? ¡Esa hoja es tuya o es una impresión mía!",
    "¿Cuál es el colmo de un electricista? Que su esposa se llame luz y sus hijas le sigan la corriente."
];
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('chiste')
        .setDescription('Cuenta un chiste al azar.'),
    name: 'chiste',
    description: 'Cuenta un chiste al azar.',
    async execute(interactionOrMessage, args = null) {
        if (args) {
            const message = interactionOrMessage;
            const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
            message.reply(randomJoke);
        }

        if (interactionOrMessage.isCommand?.()) {
            const interaction = interactionOrMessage;
            const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
            interaction.reply(randomJoke);
        }
    },
};
