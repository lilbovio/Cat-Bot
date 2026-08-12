const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

const commands = {
    moderacion: [
        { name: 'ban', description: 'Prohíbe a un usuario del servidor.' },
        { name: 'kick', description: 'Expulsa a un usuario del servidor.' },
        { name: 'mute', description: 'Silencia a un usuario temporalmente.' },
        { name: 'lock', description: 'Bloquea un canal.' },
        { name: 'unlock', description: 'Desbloquea un canal.' },
        { name: 'warn', description: 'Advierte a un usuario y lo registra.' },
        { name: 'seewarns', description: 'Muestra los warns de un usuario.' },
    ],
    juego: [
        { name: 'coin', description: 'Lanza una moneda al aire.' },
        { name: 'howgay', description: 'Muestra qué tan gay es alguien.' },
        { name: 'love', description: 'Muestra cuánto se aman dos usuarios.' },
        { name: 'impostor', description: 'Determina si alguien es el impostor.' },
        { name: '8ball', description: 'Haz una pregunta a la bola mágica.' },
        { name: 'bj', description: 'Juega un juego de blackjack contra el bot.' },
        { name: 'chiste', description: 'Haz que el bot cuente un chiste.' },
        { name: 'minigame', description: 'Juega un minijuego de adivinar el número.' },
        { name: 'sexualidad', description: 'Muestra la sexualidad de un usuario.' },
    ],
    actividades: [
        { name: 'hug', description: 'Abraza a un usuario mencionado.' },
        { name: 'kiss', description: 'Besa a un usuario mencionado.' },
        { name: 'slap', description: 'Abofetea a un usuario mencionado.' },
        { name: 'cuddle', description: 'Abraza a un usuario mencionado.' },
        { name: 'pat', description: 'Acaricia a un usuario mencionado.' },
        { name: 'poke', description: 'Picotea a un usuario mencionado.' },
        { name: 'tickle', description: 'Cosquillea a un usuario mencionado.' },
        { name: 'pokemon', description: 'Muestra un pokémon al azar.' },
        { name: 'waifu', description: 'Muestra la imagen de una waifu al azar (NSFW).' },
    ],
    utilidad: [
        { name: 'serverinfo', description: 'Muestra información del servidor.' },
        { name: 'userinfo', description: 'Muestra información de un usuario.' },
        { name: 'chinfo', description: 'Muestra información del canal.' },
        { name: 'say', description: 'Haz que el bot diga algo.' },
        { name: 'math', description: 'Resuelve una operación matemática.' },
        { name: 'afk', description: 'Ponte en modo afk para que no te molesten.' },
        { name: 'avatar', description: 'Mira el avatar de un usuario mencionado.' },
        { name: 'invite', description: 'Link para invitar al bot a tu servidor.' },
        { name: 'ping', description: 'Muestra el ping de respuesta del bot.' },
        { name: 'profilepicture', description: 'Mira el avatar de un usuario mencionado.' },
        { name: 'queja', description: 'Envía una queja a nuestro servidor de soporte.' },
        { name: 'setprefix', description: 'Cambia el prefijo del bot en el servidor.' },
        { name: 'setwelcome', description: 'Establece el mensaje de bienvenida del bot.' },
        { name: 'botinfo', description: 'Muestra información sobre el bot.' },
    ],
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Muestra el menú de ayuda.'),
    name: 'help',
    description: 'Muestra el menú de ayuda.',
    async execute(interactionOrMessage, args = null) {
        const isSlashCommand = interactionOrMessage.isCommand?.();
        const channel = isSlashCommand
            ? interactionOrMessage.channel
            : interactionOrMessage.channel;
        const userId = isSlashCommand
            ? interactionOrMessage.user.id
            : interactionOrMessage.author.id;

        if (args && args.length > 0) {
            const commandName = args[0].toLowerCase();

            // Buscar el comando en las categorías
            let commandFound = null;
            for (const category in commands) {
                const command = commands[category].find(cmd => cmd.name === commandName);
                if (command) {
                    commandFound = command;
                    break;
                }
            }

            if (commandFound) {
                const embed = new EmbedBuilder()
                    .setTitle(`Ayuda para el comando: ${commandFound.name}`)
                    .setDescription(commandFound.description)
                    .setColor('Blue');

                return isSlashCommand
                    ? interactionOrMessage.reply({ embeds: [embed] })
                    : interactionOrMessage.reply({ embeds: [embed] });
            } else {
                return isSlashCommand
                    ? interactionOrMessage.reply('No se encontró ese comando. Usa `/help` para ver los comandos disponibles.')
                    : interactionOrMessage.reply('No se encontró ese comando. Usa `!help` para ver los comandos disponibles.');
            }
        }

        // Menú inicial
        const embed = new EmbedBuilder()
            .setTitle('Menú de ayuda')
            .setDescription('Escribe el nombre de una categoría para ver más detalles:\n  - **moderacion** \n- **juego** \n- **actividades** \n- **utilidad**')
            .setFooter({ text: 'Escribe el nombre de la categoría para obtener más información.' })
            .setColor('Blue');

        const menuMessage = await (isSlashCommand
            ? interactionOrMessage.reply({ embeds: [embed], fetchReply: true })
            : interactionOrMessage.reply({ embeds: [embed] }));

        // Crear filtro para capturar el mensaje del usuario
        const filter = (response) => response.author.id === userId;

        // Esperar respuesta del usuario
        const collector = channel.createMessageCollector({ filter, time: 60000 });

        collector.on('collect', (msg) => {
            const category = msg.content.toLowerCase();

            if (commands[category]) {
                const commandsList = commands[category]
                    .map(cmd => `**${cmd.name}**: ${cmd.description}`)
                    .join('\n');

                const categoryEmbed = new EmbedBuilder()
                    .setTitle(`Ayuda - ${category.charAt(0).toUpperCase() + category.slice(1)}`)
                    .setDescription(commandsList)
                    .setColor('Blue');

                menuMessage.edit({ embeds: [categoryEmbed] });
                collector.stop(); // Detiene el colector una vez que se encuentra una categoría válida
            } else {
                msg.reply('Categoría no encontrada. Por favor, intenta de nuevo.');
            }
        });

        collector.on('end', (collected, reason) => {
            if (reason !== 'user') {
                menuMessage.edit({
                    content: 'El tiempo para seleccionar una categoría ha terminado.',
                    embeds: [],
                });
            }
        });
    },
};