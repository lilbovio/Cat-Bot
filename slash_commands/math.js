const { evaluate } = require('mathjs');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('math')
        .setDescription('Resuelve una operación matemática.')
        .addStringOption(option =>
            option.setName('operacion')
                .setDescription('La operación matemática a resolver.')
                .setRequired(true)),
    name: 'math',
    description: 'Resuelve una operación matemática.',
    async execute(interactionOrMessage, args = null) {
        const operation = args ? args.join(' ') : interactionOrMessage.options.getString('operacion');

        if (!operation) {
            const replyContent = 'Por favor, proporciona una operación matemática.';
            return args ? interactionOrMessage.reply(replyContent) : interactionOrMessage.reply({ content: replyContent, ephemeral: true });
        }

        try {
            const result = evaluate(operation);
            const response = `El resultado es: ${result}`;
            args ? interactionOrMessage.reply(response) : interactionOrMessage.reply({ content: response });
        } catch (error) {
            const errorResponse = 'Hubo un error al evaluar la operación. Por favor, verifica tu entrada.';
            args ? interactionOrMessage.reply(errorResponse) : interactionOrMessage.reply({ content: errorResponse, ephemeral: true });
        }
    },
};
