const {
    SlashCommandBuilder, EmbedBuilder,
    ActionRowBuilder, ButtonBuilder, ButtonStyle,
} = require('discord.js');

const SUIT_EMOJI = { corazones: '♥️', diamantes: '♦️', tréboles: '♣️', espadas: '♠️' };

function buildDeck() {
    const suits  = ['corazones', 'diamantes', 'tréboles', 'espadas'];
    const values = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
    const deck   = suits.flatMap((s) => values.map((v) => ({ suit: s, value: v })));
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

function cardValue(card) {
    if (['J','Q','K'].includes(card.value)) return 10;
    if (card.value === 'A') return 11;
    return parseInt(card.value, 10);
}

function handValue(hand) {
    let total = hand.reduce((acc, c) => acc + cardValue(c), 0);
    let aces  = hand.filter((c) => c.value === 'A').length;
    while (total > 21 && aces-- > 0) total -= 10;
    return total;
}

function formatHand(hand) {
    return hand.map((c) => `**${c.value}**${SUIT_EMOJI[c.suit]}`).join('  ');
}

function buildEmbed(playerHand, botHand, hideBotSecond = true, result = null) {
    const pv  = handValue(playerHand);
    const bv  = handValue(botHand);
    const color = result === '🎉 ¡Ganaste!' ? 'Green'
                : result === '🤖 El bot gana.' ? 'Red'
                : result ? 'Yellow' : 'Blue';

    const botDisplay = hideBotSecond
        ? `${formatHand([botHand[0]])}  🂠`
        : `${formatHand(botHand)}  **(${bv})**`;

    return new EmbedBuilder()
        .setTitle('🃏 Blackjack')
        .setColor(color)
        .addFields(
            { name: `Tu mano (${pv})`, value: formatHand(playerHand), inline: false },
            { name: 'Mano del bot',    value: botDisplay,              inline: false },
        )
        .setFooter(result ? { text: result } : { text: '¿Qué haces?' });
}

function buildButtons(disabled = false, canDouble = false) {
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('bj_hit')   .setLabel('Pedir 🃏').setStyle(ButtonStyle.Primary).setDisabled(disabled),
        new ButtonBuilder().setCustomId('bj_stand') .setLabel('Quedarse 🛑').setStyle(ButtonStyle.Secondary).setDisabled(disabled),
        new ButtonBuilder().setCustomId('bj_double').setLabel('Doblar 💰').setStyle(ButtonStyle.Success).setDisabled(disabled || !canDouble),
    );
    return [row];
}

module.exports = {
    name: 'bj',
    description: 'Juega un juego de blackjack contra el bot.',
    category: 'fun',
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('bj')
        .setDescription('Juega un juego de blackjack contra el bot.'),

    async execute(ctx) {
        // Only works properly as slash (buttons need interaction to update)
        if (!ctx.isSlash) {
            return ctx.reply('🃏 Este comando solo funciona como comando slash (`/bj`).');
        }

        const deck       = buildDeck();
        const playerHand = [deck.pop(), deck.pop()];
        const botHand    = [deck.pop(), deck.pop()];
        let   doubled    = false;

        const embed = buildEmbed(playerHand, botHand, true);
        const msg   = await ctx.interaction.reply({
            embeds:     [embed],
            components: buildButtons(false, true),
            fetchReply: true,
        });

        const collector = msg.createMessageComponentCollector({
            filter: (i) => i.user.id === ctx.user.id,
            time:   60000,
        });

        collector.on('collect', async (i) => {
            await i.deferUpdate();

            if (i.customId === 'bj_hit' || i.customId === 'bj_double') {
                if (i.customId === 'bj_double') doubled = true;
                playerHand.push(deck.pop());
                const pv = handValue(playerHand);

                if (pv > 21 || i.customId === 'bj_double') {
                    collector.stop('done');
                    return;
                }
                await i.message.edit({
                    embeds:     [buildEmbed(playerHand, botHand, true)],
                    components: buildButtons(false, false), // no more double after first hit
                });
            } else if (i.customId === 'bj_stand') {
                collector.stop('done');
            }
        });

        collector.on('end', async () => {
            while (handValue(botHand) < 17) botHand.push(deck.pop());
            const pv = handValue(playerHand);
            const bv = handValue(botHand);

            let result;
            if (pv > 21)             result = '🤖 El bot gana. (Te pasaste)';
            else if (bv > 21)        result = '🎉 ¡Ganaste! (El bot se pasó)';
            else if (pv > bv)        result = '🎉 ¡Ganaste!';
            else if (pv < bv)        result = '🤖 El bot gana.';
            else                     result = '🤝 ¡Empate!';

            if (doubled) result += ' (doble)';

            await msg.edit({
                embeds:     [buildEmbed(playerHand, botHand, false, result)],
                components: buildButtons(true, false),
            }).catch(() => {});
        });
    },
};
