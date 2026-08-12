module.exports = {
    name: 'love',
    description: 'Muestra cuánto se aman dos usuarios.',
    execute(message, args) {
        const mentions = message.mentions.users;
        const user1 = mentions.at(0);
        const user2 = mentions.at(1);

        if (!user1 || !user2) {
            return message.reply('Por favor, menciona a dos usuarios.');
        }

        const percentage = Math.floor(Math.random() * 101);
        message.reply(`${user1} y ${user2} tienen un **${percentage}%** de compatibilidad ❤️`);
    },
};