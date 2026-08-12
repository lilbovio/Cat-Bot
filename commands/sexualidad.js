const sexualities = ['Gay', 'Lesbiana', 'Femboy', 'Trans', 'Bisexual', 'Pansexual', 'Heterosexual'];

module.exports = {
    name: 'sexualidad',
    description: 'Muestra la sexualidad de alguien.',
    execute(message, args) {
        const target = message.mentions.users.first() || message.author;
        const randomSexuality = sexualities[Math.floor(Math.random() * sexualities.length)];
        message.reply(`${target} es **${randomSexuality}**.`);
    },
};