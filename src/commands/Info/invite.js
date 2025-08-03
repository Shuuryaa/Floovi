const {
  Message,
  PermissionFlagsBits,
  EmbedBuilder,
  ButtonStyle,
  ButtonBuilder,
  ActionRowBuilder,
} = require("discord.js");

module.exports = {
  name: "invite",
  aliases: ["inv"],
  description: "invite me",
  // userPermissions: PermissionFlagsBits.SendMessages,
  // botPermissions: PermissionFlagsBits.SendMessages,
  category: "Info",
  cooldown: 5,
  //premium: true,

  run: async (client, message, args, prefix) => {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Floovi")
        .setStyle(ButtonStyle.Link)
        .setEmoji(`<:invite:1279039307985977354>`)
        .setURL(
          `https://discord.com/oauth2/authorize?client_id=1340602825566195834`
        ),
      new ButtonBuilder()
        .setLabel("Support Server")
        .setStyle(ButtonStyle.Link)
        .setURL(`${client.config.ssLink}`)
        .setEmoji(`<:support:1279039313451159553>`)
    );

    message.reply({ content: `**Invite Me In Your Servers, For High Quality Music Ever!**`, components: [row] });
  },
};
