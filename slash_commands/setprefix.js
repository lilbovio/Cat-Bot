const { SlashCommandBuilder } = require('@discordjs/builders');
const GuildConfig = require('../models/GuildConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setprefix')
        .setDescription('Cambia el prefijo del bot en este servidor.')
        .addStringOption(option =>
            option.setName('prefijo')
                .setDescription('El nuevo prefijo que deseas establecer.')
                .setRequired(true)),
    name: 'setprefix',
    description: 'Cambia el prefijo del bot en este servidor.',
    async execute(context, args) {
        let newPrefix;
        let guildId;

        // Verificar si el usuario tiene permisos de administrador
        const member = context.member || context.guild.members.cache.get(context.author.id);
        if (!member.permissions.has('Administrator')) {
            return context.reply('No tienes permiso para usar este comando. Necesitas ser administrador.');
        }

        // Verificar si el comando es una interacción (slash command)
        if (context.isChatInputCommand?.()) {
            newPrefix = context.options.getString('prefijo');
            guildId = context.guild.id;
        } 
        // Caso para comandos con prefijo (!setprefix)
        else if (context.guild) {
            if (!args.length) {
                return context.reply('Debes proporcionar un nuevo prefijo.');
            }
            newPrefix = args[0];
            guildId = context.guild.id;
        } 
        else {
            return context.reply('Este comando solo puede usarse en servidores.');
        }

        if (!newPrefix) {
            return context.reply('Debes proporcionar un nuevo prefijo válido.');
        }

        try {
            // Buscar o crear la configuración del servidor en la base de datos
            let guildConfig = await GuildConfig.findOne({ guildId });
            if (!guildConfig) {
                guildConfig = new GuildConfig({ guildId, prefix: newPrefix });
            } else {
                guildConfig.prefix = newPrefix;
            }

            await guildConfig.save();
            context.reply(`El prefijo ha sido cambiado a \`${newPrefix}\` correctamente.`);
        } catch (error) {
            console.error('Error al cambiar el prefijo:', error);
            context.reply('Hubo un error al intentar cambiar el prefijo. Inténtalo más tarde.');
        }
    },
};
