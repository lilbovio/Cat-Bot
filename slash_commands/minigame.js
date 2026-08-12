const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('minigame')
        .setDescription('Juega un juego de adivinanza de números.'),
    name: 'minigame',
    description: 'Juega un juego de adivinanza de números.',
    async execute(interactionOrMessage, args = null) {
        const randomNumber = Math.floor(Math.random() * 10) + 1;

        if (args) {
            // Modo prefijo
            const message = interactionOrMessage;
            message.channel.send('¡Adivina un número entre 1 y 10!').then(() => {
                const filter = response => response.author.id === message.author.id;
                message.channel.awaitMessages({ filter, max: 1, time: 15000, errors: ['time'] })
                    .then(collected => {
                        const guess = parseInt(collected.first().content, 10);
                        const response = guess === randomNumber
                            ? '¡Felicidades! Adivinaste el número correcto.'
                            : `Lo siento, el número correcto era ${randomNumber}.`;
                        message.channel.send(response);
                    }).catch(() => {
                        message.channel.send('¡Se acabó el tiempo!');
                    });
            });
        } else {
            // Modo slash command
            const interaction = interactionOrMessage;

            if (!interaction.channel) {
                return interaction.reply('Este comando solo puede ejecutarse en un canal de texto.');
            }

            await interaction.reply('¡Adivina un número entre 1 y 10!');

            const filter = response => response.author.id === interaction.user.id;
            const collector = interaction.channel.createMessageCollector({ filter, time: 15000 });

            collector.on('collect', collected => {
                const guess = parseInt(collected.content, 10);
                const response = guess === randomNumber
                    ? '¡Felicidades! Adivinaste el número correcto.'
                    : `Lo siento, el número correcto era ${randomNumber}.`;
                interaction.followUp(response);
                collector.stop();
            });

            collector.on('end', (collected, reason) => {
                if (reason === 'time') {
                    interaction.followUp('¡Se acabó el tiempo!');
                }
            });
        }
    },
};
