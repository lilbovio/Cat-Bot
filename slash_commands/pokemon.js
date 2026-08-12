const axios = require('axios');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pokemon')
        .setDescription('Muestra un Pokémon aleatorio.'),
    name: 'pokemon',
    description: 'Muestra un Pokémon aleatorio.',
    async execute(context, args, client) {
        const isInteraction = context.isChatInputCommand?.(); // Verifica si es una interacción
        const user = isInteraction ? context.user : context.author;

        try {
            const randomId = Math.floor(Math.random() * 898) + 1; // Total de Pokémon
            const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
            const { name, sprites } = response.data;

            const content = `¡Apareció un **${name.toUpperCase()}**!`;

            if (isInteraction) {
                await context.reply({ content, files: [sprites.front_default] });
            } else {
                await context.reply({ content, files: [sprites.front_default] });
            }
        } catch (error) {
            const errorMessage = 'No se pudo obtener el Pokémon. Inténtalo de nuevo.';
            if (isInteraction) {
                await context.reply({ content: errorMessage, ephemeral: true });
            } else {
                context.reply(errorMessage);
            }
        }
    },
};
