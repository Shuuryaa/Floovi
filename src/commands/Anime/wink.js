const { EmbedBuilder } = require('discord.js');
const anime = require('anime-actions');
module.exports = {
  name: 'wink',
  description: 'Wink at someone!',
  cooldown: 5,
  run: async (client, message, args) => {
    const sender = message.author;
    const targetUser = message.mentions.users.first();
    const winkGif = await anime.wink();

    const embed = new EmbedBuilder()
      .setColor('#000000')
      .setDescription(`${sender} winks at ${targetUser || 'the air'} 😉`)
      .setImage(winkGif);

    message.reply({ embeds: [embed] });
  },
};
