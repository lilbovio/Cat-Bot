module.exports = {
    name: 'queja',
    description: 'Envía una queja al canal de quejas del servidor.',
    async execute(message, args) {
        const complaintChannelId = '1321758906644566078'; // ID del canal de quejas
        const complaint = args.join(' ');

        if (!complaint) {
            return message.reply('Por favor, escribe tu queja después del comando `!queja`.');
        }

        try {
            const complaintChannel = await message.client.channels.fetch(complaintChannelId);
            if (!complaintChannel || !complaintChannel.isTextBased()) throw new Error('Canal no disponible.');

            await complaintChannel.send({
                content: `📢 **Nueva Queja Recibida**\n` +
                         `**Usuario:** ${message.author.tag}\n` +
                         `**Queja:** ${complaint}`,
            });

            message.reply('Tu queja ha sido enviada. Gracias por tus comentarios. Para mejorar tu experiencia con el soporte, únete a nuestro servidor: https://discord.gg/6cKEZF3G5P, recuerda que el mal uso de este comando puede llevar a una sancion como ser incluido en la blacklist!');
        } catch (error) {
            console.error('Error al enviar la queja:', error);
            message.reply('Hubo un error al enviar tu queja. Intenta de nuevo más tarde.');
        }
    },
};
