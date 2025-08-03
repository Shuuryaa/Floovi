const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const badgeMap = {
  "123456789012345678": { emoji: "🤝", label: "Owner's Friend" },
  "1380395674306220045": { emoji: "🙏", label: "Floovi User" },
  "345678901234567890": { emoji: "👑", label: "Server Booster" },
  "1380395652185325568": { emoji: "💻", label: "Developer" },
  "567890123456789012": { emoji: "🎖️", label: "VIP" },
  "678901234567890123": { emoji: "<:customemoji:112233445566778899>", label: "OG Member" },
};

module.exports = {
  name: "profile",
  aliases: ["userinfo", "badges"],
  description: "Show user profile with badges and privileges",
  category: "Info",
  cooldown: 5,

  run: async (client, message, args) => {
    const user = message.mentions.users.first() || message.author;
    const member = message.guild.members.cache.get(user.id);

    const userBadges = member.roles.cache
      .filter(role => badgeMap[role.id])
      .map(role => {
        const badge = badgeMap[role.id];
        return `${badge.emoji} ${badge.label}`;
      });

    const allBadges = userBadges.length > 0 ? userBadges.join("\n") : "No Badges";

    const embed = new EmbedBuilder()
      .setColor(client.color)
      .setAuthor({
        name: `${user.username} - Profile`,
        iconURL: user.displayAvatarURL({ dynamic: true })
      })
      .addFields(
        {
          name: `🎫 Badges [${userBadges.length}]`,
          value: allBadges,
          inline: false
        },
        {
          name: "🛡️ Privileges",
          value: "`{}` Global No Prefix", // You can replace this dynamically
          inline: false
        },
        {
          name: "👤 Requested By",
          value: `${message.author}`,
          inline: false
        }
      )
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: `User ID: ${user.id}` });

    const button = new ButtonBuilder()
      .setLabel(`Support Server`)
      .setStyle(ButtonStyle.Link)
      .setEmoji("🔗")
      .setURL(`https://discord.gg/G4Uc7mwfwM`);

    const row = new ActionRowBuilder().addComponents(button);

    return message.reply({
      embeds: [embed],
      components: [row]
    });
  },
};