const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const AfkSchema = require('../../../models/afkSchema');

module.exports = {
    name: 'afk',
    description: 'Activa el modo AFK para que la gente sepa que no estás disponible.',
    category: 'utility',
    cooldown: 10,
    data: new SlashCommandBuilder()
        .setName('afk')
        .setDescription('Activa el modo AFK.')
        .addStringOption((o) =>
            o.setName('razon').setDescription('Razón de por qué estás AFK.').setRequired(false)
        ),
    async execute(ctx) {
        const reason = ctx.getString('razon') || 'Sin razón';
        await AfkSchema.findOneAndUpdate(
            { userId: ctx.user.id },
            { reason, timestamp: Date.now() },
            { upsert: true, new: true }
        );
        const embed = new EmbedBuilder()
            .setColor('Blue')
            .setTitle('🛌 Modo AFK activado')
            .setDescription(`Tu estado AFK ha sido activado.\n**Razón:** ${reason}`)
            .setTimestamp();
        await ctx.reply({ embeds: [embed] });
    },
};
