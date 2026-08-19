const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

function hexToRgb(hex) {
    const n = parseInt(hex.replace('#', ''), 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

module.exports = {
    name: 'color',
    description: 'Muestra información de un color hexadecimal.',
    category: 'utility',
    cooldown: 3,
    data: new SlashCommandBuilder()
        .setName('color')
        .setDescription('Muestra información de un color hexadecimal.')
        .addStringOption((o) =>
            o.setName('hex').setDescription('Color en formato hex (ej: #FF5733 o FF5733).').setRequired(true)
        ),
    async execute(ctx) {
        let hex = ctx.getString('hex').replace('#', '').trim();
        if (!/^[0-9A-Fa-f]{6}$/.test(hex))
            return ctx.reply({ content: '❌ Formato inválido. Usa 6 dígitos hex (ej: `FF5733`).', ephemeral: true });

        const { r, g, b } = hexToRgb(hex);
        const decColor = parseInt(hex, 16);
        const previewUrl = `https://singlecolorimage.com/get/${hex}/200x200`;

        const embed = new EmbedBuilder()
            .setTitle(`🎨 Color #${hex.toUpperCase()}`)
            .setColor(decColor)
            .setThumbnail(previewUrl)
            .addFields(
                { name: 'HEX',  value: `#${hex.toUpperCase()}`,  inline: true },
                { name: 'RGB',  value: `rgb(${r}, ${g}, ${b})`,  inline: true },
                { name: 'DEC',  value: `${decColor}`,            inline: true }
            );
        await ctx.reply({ embeds: [embed] });
    },
};
