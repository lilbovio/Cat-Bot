const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    // Configuración para slash commands
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Banea a un usuario del servidor.')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('El usuario que deseas banear.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('razon')
                .setDescription('Razón del baneo.')
                .setRequired(false)),

    // Configuración para comandos con prefijo
    name: 'ban',
    description: 'Banea a un usuario del servidor.',

    async execute(interactionOrMessage, args = null) {
        const esSlashCommand = interactionOrMessage.isCommand?.();
        const guild = interactionOrMessage.guild;

        // Manejo para slash commands
        if (esSlashCommand) {
            const interaction = interactionOrMessage;

            if (!interaction.member.permissions.has('BAN_MEMBERS')) {
                return interaction.reply({ content: '❌ No tienes permisos para banear usuarios.', ephemeral: true });
            }

            const usuario = interaction.options.getUser('usuario');
            const razon = interaction.options.getString('razon') || 'No se proporcionó una razón.';

            const miembro = await guild.members.fetch(usuario.id).catch(() => null);
            if (!miembro) {
                return interaction.reply({ content: '❌ No se pudo encontrar a ese usuario en el servidor.', ephemeral: true });
            }

            if (!miembro.bannable) {
                return interaction.reply({ content: '❌ No puedo banear a ese usuario.', ephemeral: true });
            }

            try {
                await miembro.ban({ reason: razon });
                return interaction.reply(`✅ **${usuario.tag}** ha sido baneado.\n**Razón:** ${razon}`);
            } catch (error) {
                console.error(error);
                return interaction.reply({ content: '❌ Hubo un error al intentar banear a ese usuario.', ephemeral: true });
            }
        }

        // Manejo para comandos con prefijo
        const message = interactionOrMessage;

        if (!message.member.permissions.has('BAN_MEMBERS')) {
            return message.reply('❌ No tienes permisos para banear usuarios.');
        }

        if (!args[0]) {
            return message.reply('❌ Por favor, menciona a un usuario para banear.');
        }

        const miembro = message.mentions.members.first() || (await guild.members.fetch(args[0]).catch(() => null));
        if (!miembro) {
            return message.reply('❌ No se pudo encontrar al usuario especificado.');
        }

        const razon = args.slice(1).join(' ') || 'No se proporcionó una razón.';

        if (!miembro.bannable) {
            return message.reply('❌ No puedo banear a ese usuario.');
        }

        try {
            await miembro.ban({ reason: razon });
            return message.channel.send(`✅ **${miembro.user.tag}** ha sido baneado.\n**Razón:** ${razon}`);
        } catch (error) {
            console.error(error);
            return message.reply('❌ Hubo un error al intentar banear a ese usuario.');
        }
    },
};
