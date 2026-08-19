const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    name: 'pokemon',
    description: 'Muestra un Pokémon aleatorio.',
    category: 'fun',
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('pokemon')
        .setDescription('Muestra un Pokémon aleatorio.'),
    async execute(ctx) {
        await ctx.defer();
        try {
            const randomId = Math.floor(Math.random() * 898) + 1;
            const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
            const { name, sprites } = response.data;
            await ctx.edit({
                content: `¡Apareció un **${name.toUpperCase()}**!`,
                files: [sprites.front_default],
            });
        } catch {
            await ctx.edit('No se pudo obtener el Pokémon. Inténtalo de nuevo.');
        }
    },
};
