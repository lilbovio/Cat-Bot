module.exports = {
    name: 'howgay',
    description: 'Muestra qué tan gay es un usuario.',
    execute(message, args) {
        const target = message.mentions.users.first() || message.author;
        const percentage = Math.floor(Math.random() * 101);
        message.reply(`${target} es **${percentage}% gay** 🏳️‍🌈`);
    },
};
