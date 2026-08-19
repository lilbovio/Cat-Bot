const { SlashCommandBuilder } = require('discord.js');
const config = require('../../../config');

module.exports = {
    name: 'queja',
    description: 'Envía una queja al servidor de soporte.',
    category: 'utility',
    cooldown: 60,
    data: new SlashCommandBuilder()
        .setName('queja')
        .setDescription('Envía una queja al servidor de soporte.')
        .addStringOption((o) =>
            o.setName('mensaje').setDescription('Tu queja o sugerencia.').setRequired(true)
        ),
    async execute(ctx) {
        const complaint = ctx.getString('mensaje');
        if (!complaint) return ctx.reply({ content: 'Por favor, escribe tu queja.', ephemeral: true });

        try {
            const complaintChannel = await ctx.client.channels.fetch(config.channels.complaint);
            if (!complaintChannel?.isTextBased()) throw new Error('Canal no disponible.');

            await complaintChannel.send({
                content: `📢 **Nueva Queja Recibida**\n**Usuario:** ${ctx.user.username} (${ctx.user.id})\n**Queja:** ${complaint}`,
            });

            await ctx.reply({
                content: `✅ Tu queja ha sido enviada. Para soporte adicional únete a: ${config.supportInvite}\n⚠️ El mal uso de este comando puede resultar en sanciones.`,
                ephemeral: true,
            });
        } catch {
            await ctx.reply({ content: '❌ Hubo un error al enviar tu queja. Intenta de nuevo más tarde.', ephemeral: true });
        }
    },
};
