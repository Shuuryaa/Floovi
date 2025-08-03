const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");
const os = require("os");
const ms = require("ms");

module.exports = {
  name: "stats",
  aliases: ["botinfo", "info"],
  description: "Displays full bot statistics.",
  category: "Info",

  run: async (client, message, args, prefix) => {
    const uptime = ms(client.uptime, { long: true });
    const memoryUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
    const cpuModel = os.cpus()[0].model;
    const totalUsers = client.guilds.cache.reduce((a, g) => a + g.memberCount, 0);

    const description = `
**Servers:** ${client.guilds.cache.size}
**Users:** ${totalUsers}
**Channels:** ${client.channels.cache.size}
**Uptime:** ${uptime}
**Memory Usage:** ${memoryUsage} MB / ${totalMem} GB
**CPU:** ${cpuModel}
**Ping:** ${client.ws.ping}ms
    `;

    const embed = new EmbedBuilder()
      .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() })
      .setColor(0x2f3136)
      .setThumbnail(client.user.displayAvatarURL())
      .setDescription(description)
      .setFooter({ text: "Made With Love <3", iconURL: message.guild.iconURL() })
      .setTimestamp();

    const systemButton = new ButtonBuilder()
      .setCustomId("stats_system")
      .setLabel("System Info")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji({ id: "1382904022595276840" });

    const teamButton = new ButtonBuilder()
      .setCustomId("stats_team")
      .setLabel("Team")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji({ id: "1341062302245326939" });

    const nodeButton = new ButtonBuilder()
      .setCustomId("stats_node")
      .setLabel("Node Info")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji({ id: "1341030546989387796" });

    const row = new ActionRowBuilder().addComponents(systemButton, teamButton, nodeButton);

    const msg = await message.channel.send({ embeds: [embed], components: [row] });

    const collector = msg.createMessageComponentCollector({ time: 60000 });

    collector.on("collect", async (i) => {
      if (i.user.id !== message.author.id) {
        return await i.reply({
          content: `This is only for ${message.author.username}`,
          ephemeral: true
        });
      }

      if (i.customId === "stats_system") {
        const sysEmbed = new EmbedBuilder()
          .setTitle("System Information")
          .setColor(0x2f3136)
          .setDescription(`
**Platform:** ${os.platform()}
**Arch:** ${os.arch()}
**CPU Cores:** ${os.cpus().length}
**Total Memory:** ${totalMem} GB
          `)
          .setFooter({ text: "Made By Floovi Dev", iconURL: message.guild.iconURL() })
          .setTimestamp();

        await i.reply({ embeds: [sysEmbed], ephemeral: true });
      }

      if (i.customId === "stats_team") {
        const teamEmbed = new EmbedBuilder()
          .setTitle("Team Information")
          .setColor(0x2f3136)
          .setDescription(`THE TEAM OF OUR BOT COMMUNITY !
**Developer:** [Surya](https://discord.com/users/1380026050104397825)
**Owners:** [Error](https://discord.com/users/1322838042897289267) & [Saksham](https://discord.com/users/1326843871274991710)
**Girl Owner:** [Daizy](https://discord.com/users/1380082829542821910)
**Co Owner:** [Hperm](https://discord.gg/users/870920814000766997)
**Manager:** [Prince](https://discord.com/users/1312397697357185146)
          `)
          .setFooter({ text: "Team Info Of Floovi", iconURL: message.guild.iconURL() })
          .setTimestamp();

        await i.reply({ embeds: [teamEmbed], ephemeral: true });
      }

      if (i.customId === "stats_node") {
        try {
          const nodes = client.manager.shoukaku.nodes;
          const node = [...nodes.values()][0];

          if (!node || !node.stats) {
            return await i.reply({ content: "No Lavalink node connected.", ephemeral: true });
          }

          const stats = node.stats;

          const description = `
**Node:** ${node.name} (${stats ? "Online" : "Offline"})

**Players:** ${stats.players}
**Playing Players:** ${stats.playingPlayers}
**Uptime:** ${formatTime(stats.uptime)}

**CPU Cores:** ${stats.cpu.cores}
**System Load:** ${(stats.cpu.systemLoad * 100).toFixed(2)}%
**Lavalink Load:** ${(stats.cpu.lavalinkLoad * 100).toFixed(2)}%

**Memory Used:** ${formatBytes(stats.memory.used)} / ${formatBytes(stats.memory.reservable)}
          `;

          const nodeEmbed = new EmbedBuilder()
            .setTitle("Node Information")
            .setColor(0x2f3136)
            .setDescription(description)
            .setFooter({ text: "Node Stats Of Floovi", iconURL: message.guild.iconURL() })
            .setTimestamp();

          await i.reply({ embeds: [nodeEmbed], ephemeral: true });

        } catch (err) {
          console.error(err);
          await i.reply({ content: "Failed to fetch node information.", ephemeral: true });
        }
      }
    });

    collector.on("end", () => {
      msg.edit({ components: [] }).catch(() => {});
    });
  }
};

// Utility Functions

function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function formatTime(milliseconds) {
  if (milliseconds < 0) return "Invalid input";
  const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
  const hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  return `${days}d ${hours}h ${minutes}m`;
}