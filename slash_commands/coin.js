const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('coin')
        .setDescription('Lanza una moneda al aire.'),
    name: 'coin',
    description: 'Lanza una moneda al aire.',
    async execute(interactionOrMessage, args = null ) {

        if ( args ) {
            const message = interactionOrMessage;
            const result = Math.random() < 0.5 ? 'Cara' : 'Sello';
            message.reply(`La moneda cayó en: **${result}**`);
        }

        if ( interactionOrMessage.isCommand?.() ) {
            const interaction = interactionOrMessage;
            const result = Math.random() < 0.5 ? 'Cara' : 'Sello';
            interaction.reply(`La moneda cayó en: **${result}**`);
        }
    },
};
