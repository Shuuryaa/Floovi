const { EmbedBuilder } = require('discord.js');
const anime = require('anime-actions');
module.exports = {
  name: 'bonk',
  description: 'Bonk someone on the head!',
  cooldown: 5,
  run: async (client, message, args) => {
    const sender = message.author;
    const targetUser = message.mentions.users.first();
    const bonkGif = await anime.bonk();

    const embed = new EmbedBuilder()
      .setColor('#000000')
      .setDescription(`${sender} bonks ${targetUser || 'the air'} on the head! 🤦‍♂️`)
      .setImage(bonkGif);

    message.reply({ embeds: [embed] });
  },
};
