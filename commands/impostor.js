module.exports = {
    name: 'impostor',
    description: 'Determina si alguien es el impostor.',
    execute(message) {
        const target = message.mentions.users.first() || message.author;
        const isImpostor = Math.random() < 0.5;
        message.reply(`${target} ${isImpostor ? 'es el impostor' : 'no es el impostor'} 🤖`);
    },
};
