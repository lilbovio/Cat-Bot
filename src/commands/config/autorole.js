const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const GuildConfig = require('../../../models/GuildConfig');

module.exports = {
    name: 'autorole',
    description: 'Configura el rol que se asigna automáticamente a nuevos miembros.',
    category: 'config',
    permissions: [PermissionFlagsBits.ManageRoles],
    data: new SlashCommandBuilder()
        .setName('autorole')
        .setDescription('Configura el rol que se asigna automáticamente a nuevos miembros.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addSubcommand((sub) =>
            sub.setName('set')
                .setDescription('Establece el rol de auto-asignación.')
                .addRoleOption((o) =>
                    o.setName('rol')
                        .setDescription('Rol a asignar automáticamente a nuevos miembros.')
                        .setRequired(true)
                )
        )
        .addSubcommand((sub) =>
            sub.setName('disable')
                .setDescription('Desactiva el auto-rol.')
        ),

    async execute(ctx) {
        const sub = ctx.getSubcommand();

        if (sub === 'set') {
            const role = ctx.getRole('rol');
            if (!role) return ctx.reply({ content: '❌ Rol no encontrado.', ephemeral: true });

            // Safety checks
            if (role.id === ctx.guild.id) {
                return ctx.reply({ content: '❌ No puedes usar el rol `@everyone` como auto-rol.', ephemeral: true });
            }
            if (role.managed) {
                return ctx.reply({ content: '❌ No puedo asignar roles gestionados por integraciones.', ephemeral: true });
            }
            const botMember = ctx.guild.members.me;
            if (role.position >= botMember.roles.highest.position) {
                return ctx.reply({ content: `❌ El rol ${role} está por encima o igual a mi rol más alto. No puedo asignarlo.`, ephemeral: true });
            }

            await GuildConfig.findOneAndUpdate(
                { guildId: ctx.guild.id },
                { autoRole: role.id },
                { upsert: true, new: true }
            );

            const embed = new EmbedBuilder()
                .setColor('Green')
                .setTitle('✅ Auto-rol configurado')
                .setDescription(`Los nuevos miembros recibirán automáticamente el rol ${role}.`)
                .setFooter({ text: `Configurado por ${ctx.user.username}` })
                .setTimestamp();

            return ctx.reply({ embeds: [embed] });
        }

        if (sub === 'disable') {
            await GuildConfig.findOneAndUpdate(
                { guildId: ctx.guild.id },
                { autoRole: null },
                { upsert: true }
            );

            const embed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('🚫 Auto-rol desactivado')
                .setDescription('Los nuevos miembros ya no recibirán un rol automático.')
                .setTimestamp();

            return ctx.reply({ embeds: [embed] });
        }
    },
};
