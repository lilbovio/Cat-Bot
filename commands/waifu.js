const axios = require('axios');

module.exports = {
    name: 'waifu',
    description: 'Muestra una waifu al azar.',
    async execute(message) {
        // Verifica si el canal tiene permisos NSFW.
        if (!message.channel.nsfw) {
            return message.reply('Este comando solo puede usarse en canales con permisos NSFW.');
        }

        try {
            // Petición a la API de waifu.pics.
            const response = await axios.get('https://api.waifu.pics/sfw/waifu');
            const waifuImage = response.data.url;

            // Enviar la imagen al canal.
            await message.channel.send({ files: [{ attachment: waifuImage, name: 'waifu.jpg' }] });
        } catch (error) {
            console.error('Error al obtener la waifu:', error);
            message.reply('No se pudo obtener una waifu en este momento. Inténtalo más tarde.');
        }
    },
};
