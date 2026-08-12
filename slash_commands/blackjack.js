const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bj')
        .setDescription('Juega un juego de blackjack contra el bot.'),
    name: 'bj',
    description: 'Juega un juego de blackjack contra el bot.',
    async execute(interactionOrMessage, args = null) {
        const isSlashCommand = interactionOrMessage.isCommand?.();
        const channel = isSlashCommand
            ? interactionOrMessage.channel
            : interactionOrMessage.channel;
        const userId = isSlashCommand
            ? interactionOrMessage.user.id
            : interactionOrMessage.author.id;

        const deck = [];
        const suits = ['corazones', 'diamantes', 'tréboles', 'espadas'];
        const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

        // Crear el mazo
        for (const suit of suits) {
            for (const value of values) {
                deck.push({ suit, value });
            }
        }

        // Barajar el mazo
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }

        const getCardValue = (card) => {
            if (['J', 'Q', 'K'].includes(card.value)) return 10;
            if (card.value === 'A') return 11;
            return parseInt(card.value, 10);
        };

        const calculateHandValue = (hand) => {
            let value = hand.reduce((acc, card) => acc + getCardValue(card), 0);
            let aces = hand.filter(card => card.value === 'A').length;
            while (value > 21 && aces > 0) {
                value -= 10;
                aces -= 1;
            }
            return value;
        };

        const playerHand = [deck.pop(), deck.pop()];
        const botHand = [deck.pop(), deck.pop()];

        let playerTurn = true;

        while (playerTurn) {
            const playerValue = calculateHandValue(playerHand);
            const botValue = calculateHandValue(botHand);

            await channel.send(
                `Tu mano: ${playerHand.map(c => `${c.value} de ${c.suit}`).join(', ')} (Value: ${playerValue})\n` +
                `Mano visible del bot: ${botHand[0].value} de ${botHand[0].suit}`
            );

            if (playerValue > 21) {
                return channel.send('¡Perdiste! La casa gana.');
            }

            await channel.send('¿Quieres `pedir` o `quedarse`?');

            const filter = (m) =>
                m.author.id === userId && ['pedir', 'quedarse'].includes(m.content.toLowerCase());
            const collected = await channel.awaitMessages({
                filter,
                max: 1,
                time: 30000,
                errors: ['time'],
            }).catch(() => null);

            if (!collected) {
                return channel.send('Tardaste demasiado en responder. Juego terminado.');
            }

            const choice = collected.first().content.toLowerCase();

            if (choice === 'pedir') {
                playerHand.push(deck.pop());
            } else {
                playerTurn = false;
            }
        }

        while (calculateHandValue(botHand) < 17) {
            botHand.push(deck.pop());
        }

        const playerValue = calculateHandValue(playerHand);
        const botValue = calculateHandValue(botHand);

        const resultEmbed = new EmbedBuilder()
            .setTitle('Resultados')
            .addFields([
                { name: 'Tu mano', value: `${playerHand.map(c => `${c.value} de ${c.suit}`).join(', ')} (Value: ${playerValue})` },
                { name: 'Repartidor', value: `${botHand.map(c => `${c.value} de ${c.suit}`).join(', ')} (Value: ${botValue})` },
            ]);

        if (botValue > 21 || playerValue > botValue) {
            resultEmbed.addFields([{ name: 'Resultado', value: '¡Ganaste!' }]);
        } else if (playerValue < botValue) {
            resultEmbed.addFields([{ name: 'Resultado', value: 'El bot gana.' }]);
        } else {
            resultEmbed.addFields([{ name: 'Resultado', value: 'Es un empate.' }]);
        }

        return channel.send({ embeds: [resultEmbed] });
    },
};
