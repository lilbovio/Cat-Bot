const { SlashCommandBuilder } = require('discord.js');
const neko = require('nekos.life');
const sfw = new neko();

// Configuración de verbos por acción (GIFs de nekos.life).
const ACTIONS = {
    hug:      { label: 'abraza',     reflexive: 'se abraza a sí mismo',     api: 'hug' },
    kiss:     { label: 'besa',       reflexive: 'se besa a sí mismo',       api: 'kiss' },
    cuddle:   { label: 'abraza',     reflexive: 'se abraza a sí mismo',     api: 'cuddle' },
    pat:      { label: 'acaricia',   reflexive: 'se acaricia a sí mismo',   api: 'pat' },
    poke:     { label: 'picotea',    reflexive: 'se pica a sí mismo',       api: 'poke' },
    slap:     { label: 'abofetea',   reflexive: 'se abofetea a sí mismo',   api: 'slap' },
    tickle:   { label: 'cosquillea', reflexive: 'se cosquillea a sí mismo', api: 'tickle' },
    bite:     { label: 'muerde',     reflexive: 'se muerde a sí mismo',     api: 'bite' },
    highfive: { label: 'choca los cinco con', reflexive: 'choca los cinco solo... qué triste', api: 'highfive' },
    wave:     { label: 'saluda',     reflexive: 'se saluda a sí mismo',     api: 'wave' },
};

// Genera un comando de actividad (hug, kiss, slap, ...) con su GIF.
function createActivityCommand(name, description, key = name) {
    const cfg = ACTIONS[key] || { label: name, reflexive: `usa ${name}`, api: key };

    return {
        name,
        description,
        category: 'activities',
        cooldown: 3,
        data: new SlashCommandBuilder()
            .setName(name)
            .setDescription(description)
            .addUserOption((option) =>
                option.setName('usuario').setDescription('Selecciona a un usuario').setRequired(false)
            ),
        async execute(ctx) {
            const gif = await sfw[cfg.api]();
            const target = await ctx.getUser('usuario');
            const actor = ctx.user.username;
            const content = target
                ? `${actor} ${cfg.label} a ${target.username}.`
                : `${actor} ${cfg.reflexive}.`;

            await ctx.reply({ content, embeds: [{ image: { url: gif.url } }] });
        },
    };
}

module.exports = { createActivityCommand };
