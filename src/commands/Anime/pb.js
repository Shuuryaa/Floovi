const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'purgebots',
    aliases: ['pb'],
    description: 'Delete all bot messages and the replied message if any.',
    run: async (client, message) => {
        try {
            // Delete replied message if exists
            if (message.reference) {
                const repliedMessage = await message.channel.messages.fetch(message.reference.messageId).catch(() => null);
                if (repliedMessage) await repliedMessage.delete().catch(() => null);
            }

            // Bulk delete bot messages
            const fetchedMessages = await message.channel.messages.fetch({ limit: 100 });
            const botMessages = fetchedMessages.filter(msg => msg.author.bot);

            await message.channel.bulkDelete(botMessages, true).catch(() => null);
            await message.delete().catch(() => null); // Delete command message

            // Confirmation Embed
            const embed = new EmbedBuilder()
                .setDescription(`Successfully deleted ${botMessages.size} bot messages.`)
                .setColor('#000000');

            const confirmationMessage = await message.channel.send({ embeds: [embed] });
            setTimeout(() => confirmationMessage.delete().catch(() => null), 5000); // Auto-delete confirmation
        } catch (error) {
            console.error(`[Purgebots Error]:`, error);
            const errorEmbed = new EmbedBuilder()
                .setDescription(`An error occurred while purging bot messages.`)
                .setColor('#000000');
            message.channel.send({ embeds: [errorEmbed] }).then(msg => setTimeout(() => msg.delete().catch(() => null), 5000));
        }
    },
};