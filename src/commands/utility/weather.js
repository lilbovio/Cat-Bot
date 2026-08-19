const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

const WMO_CODES = {
    0:'Cielo despejado', 1:'Principalmente despejado', 2:'Parcialmente nublado', 3:'Nublado',
    45:'Niebla', 48:'Niebla helada', 51:'Llovizna ligera', 53:'Llovizna moderada', 55:'Llovizna intensa',
    61:'Lluvia ligera', 63:'Lluvia moderada', 65:'Lluvia intensa',
    71:'Nieve ligera', 73:'Nieve moderada', 75:'Nieve intensa',
    80:'Chubascos ligeros', 81:'Chubascos moderados', 82:'Chubascos intensos',
    95:'Tormenta eléctrica', 99:'Tormenta con granizo',
};

module.exports = {
    name: 'weather',
    description: 'Muestra el clima actual de una ciudad.',
    category: 'utility',
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('weather')
        .setDescription('Muestra el clima actual de una ciudad.')
        .addStringOption((o) => o.setName('ciudad').setDescription('Nombre de la ciudad.').setRequired(true)),
    async execute(ctx) {
        const ciudad = ctx.getString('ciudad');
        await ctx.defer();
        try {
            // Geocoding gratuito de Open-Meteo
            const geo = await axios.get(
                `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(ciudad)}&count=1&language=es&format=json`,
                { timeout: 8000 }
            );
            if (!geo.data.results?.length)
                return ctx.edit(`❌ No se encontró la ciudad **${ciudad}**.`);
            const { name, country, latitude, longitude } = geo.data.results[0];

            const wx = await axios.get(
                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
                `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weathercode&wind_speed_unit=kmh&timezone=auto`,
                { timeout: 8000 }
            );
            const c = wx.data.current;
            const desc = WMO_CODES[c.weathercode] || `Código ${c.weathercode}`;

            const embed = new EmbedBuilder()
                .setTitle(`🌍 Clima en ${name}, ${country}`)
                .setColor('Blue')
                .addFields(
                    { name: '🌡️ Temperatura',   value: `${c.temperature_2m}°C`,          inline: true },
                    { name: '💧 Humedad',        value: `${c.relative_humidity_2m}%`,      inline: true },
                    { name: '💨 Viento',         value: `${c.wind_speed_10m} km/h`,        inline: true },
                    { name: '🌤️ Condición',      value: desc,                              inline: false }
                )
                .setTimestamp();
            await ctx.edit({ embeds: [embed] });
        } catch {
            await ctx.edit('❌ No se pudo obtener el clima en este momento.');
        }
    },
};
