const {
  EmbedBuilder
} = require("discord.js");
const noPrefix = require("../../models/NoPrefixSchema.js");
const ownerIDS = [
    "1312397697357185146",
    "1380026050104397825",
    "1322838042897289267",
    "1326843871274991710",
    "1357775697476845600"
    ]

module.exports = {
  name: "noprefix",
  aliases: ["nopre", "np"],
  description: "Add or remove users from the NoPrefix list",
  category: "Owner",
  ownerOnly: false,

  run: async (client, message, args, prefix) => {

    // Check for authorized owners
    if (!ownerIDS.includes(message.author.id)) return; // silent ignore

    try {
      let userId;
      if (message.mentions.users.size) {
        userId = message.mentions.users.first().id;
      } else if (args[1] && !isNaN(args[1])) {
        userId = args[1];
      }

      if (!args[0]) {
        const embed = new EmbedBuilder()
          .setColor(client.color)
          .setDescription(`Use: \`${prefix}noprefix add/remove/list [user mention or ID]\``);
        return message.channel.send({ embeds: [embed] });
      }

      if (args[0].toLowerCase() === "add") {
        if (!userId) {
          return message.channel.send({
            embeds: [new EmbedBuilder().setColor(client.color).setDescription("Please provide a valid user mention or ID to add.")]
          });
        }

        let duration = null;
        if (args[2]) {
          const timeMatch = args[2].match(/^(\d+)(s|m|h|d|w|y)$/);
          if (timeMatch) {
            const value = parseInt(timeMatch[1]);
            const unit = timeMatch[2];
            const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000, w: 604800000, y: 31557600000 };
            duration = value * multipliers[unit];
          }
        }

        const existingData = await noPrefix.findOne({ userId });
        if (existingData) {
          return message.channel.send({
            embeds: [new EmbedBuilder().setColor(client.color).setDescription("User already has NoPrefix.")]
          });
        }

        const expireAt = duration ? Date.now() + duration : null;
        await noPrefix.create({ userId, expireAt });

        return message.channel.send({
          embeds: [
            new EmbedBuilder()
              .setColor(client.color)
              .setDescription(`Now <@${userId}> is added to the NoPrefix list.\n\n**Duration:** ${duration ? formatDuration(duration) : "Unlimited"}`)
          ]
        });
      }

      if (args[0].toLowerCase() === "remove") {
        if (!userId) {
          return message.channel.send({
            embeds: [new EmbedBuilder().setColor(client.color).setDescription("Please provide a valid user mention or ID to remove.")]
          });
        }

        const data = await noPrefix.findOne({ userId });
        if (!data) {
          return message.channel.send({
            embeds: [new EmbedBuilder().setColor(client.color).setDescription("This user doesn't have NoPrefix.")]
          });
        }

        await noPrefix.findOneAndDelete({ userId });
        return message.channel.send({
          embeds: [new EmbedBuilder().setColor(client.color).setDescription(`Now <@${userId}> is removed from the NoPrefix list.`)]
        });
      }

      if (args[0].toLowerCase() === "list" || args[0].toLowerCase() === "show") {
        const data = await noPrefix.find();
        if (!data.length) {
          return message.channel.send({
            embeds: [new EmbedBuilder().setColor(client.color).setDescription("No users found in the NoPrefix list.")]
          });
        }

        let users = [];
        for (let i = 0; i < data.length; i++) {
          try {
            const user = await client.users.fetch(data[i].userId);
            let expiryText;

            if (data[i].expireAt) {
              let remainingTime = data[i].expireAt - Date.now();
              if (remainingTime > 0) {
                expiryText = `Expires in ${formatDuration(remainingTime)}`;
              } else {
                await noPrefix.findOneAndDelete({ userId: data[i].userId });
                continue;
              }
            } else {
              expiryText = "Unlimited";
            }

            users.push(`[${i + 1}]. [${user.globalName || user.username}](https://discord.com/users/${user.id}) - ${expiryText}`);
          } catch (e) {
            continue;
          }
        }

        if (!users.length) {
          return message.channel.send({
            embeds: [new EmbedBuilder().setColor(client.color).setDescription("No active NoPrefix users found.")]
          });
        }

        const embed = new EmbedBuilder()
          .setColor(client.color)
          .setTitle("No Prefix List")
          .setDescription(users.join("\n"));

        return message.channel.send({ embeds: [embed] });
      }

    } catch (error) {
      console.log(error);
    }
  }
};

function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000) % 60;
  const minutes = Math.floor(ms / 60000) % 60;
  const hours = Math.floor(ms / 3600000) % 24;
  const days = Math.floor(ms / 86400000) % 7;
  const weeks = Math.floor(ms / 604800000) % 52;
  const years = Math.floor(ms / 31557600000);

  let parts = [];
  if (years) parts.push(`${years}y`);
  if (weeks) parts.push(`${weeks}w`);
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  if (seconds) parts.push(`${seconds}s`);

  return parts.length ? parts.join(", ") : "0s";
}