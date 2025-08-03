const { EmbedBuilder, ChannelType } = require("discord.js");
const reconnectAuto = require("../models/reconnect.js");

module.exports = async (client, player, track) => {
  // 🔰 Validate required IDs
  const guildId = player?.guild;
  const textChannelId = player?.textChannel;
  const voiceChannelId = player?.voiceChannel;
  if (!guildId || !textChannelId || !voiceChannelId) return;

  // 🔰 Fetch text channel safely
  const textChannel = client.channels.cache.get(textChannelId);
  if (!textChannel || textChannel.type !== ChannelType.GuildText) return;

  // 🔰 Fetch voice channel safely
  const voiceChannel = client.channels.cache.get(voiceChannelId);
  if (!voiceChannel || voiceChannel.type !== ChannelType.GuildVoice) return;

  // 🔰 Fetch guild from voice channel
  const guild = voiceChannel.guild;
  if (!guild) return;

  // 🔰 Fetch bot's own member object
  const botMember = guild.members.me;
  if (!botMember) return;

  // 6️⃣ Queue resumed notice
  if (player.get("wasEmptyQueue")) {
    player.set("wasEmptyQueue", false);
    await textChannel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(client.color)
          .setDescription(`<:floovi_tick:1381965556277710860> The queue has resumed after being empty earlier.`),
      ],
    });
  }

  // 2️⃣ Unplayable track check
  if (track.duration === 0 && !track.isStream) {
    player.stop();
    return textChannel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(client.color)
          .setDescription(`<:floovi_cross:1382029455601569904> This track appears to be broken or unplayable. I’ve skipped it.`),
      ],
    });
  }

  // 3️⃣ Autopause if bot alone and autoplay enabled
  const humanMembers = voiceChannel.members.filter(m => !m.user.bot);
  if (humanMembers.size === 0 && player.get("autoplay")) {
    player.pause(true);
    return textChannel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(client.color)
          .setDescription(`<:floovi_warn:1382779289858211880> I'm alone in the VC. I've paused autoplay until someone joins.`),
      ],
    });
  }

  // 1️⃣ Anti-earrape check
  if (player.volume > 150 && track.duration > 5 * 60 * 1000) {
    player.setVolume(100);
    await textChannel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(client.color)
          .setDescription(`<:floovi_warn:1382779289858211880> Volume was too high for a long track. I’ve lowered it to \`100%\`.`),
      ],
    });
  }

  // 🔁 24/7 reconnect check
  const reconnect = await reconnectAuto.findOne({ guildId });
  if (reconnect?.enabled && !reconnect.vcId) {
    await textChannel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(client.color)
          .setDescription(`<:floovi_warn:1382779289858211880> **24/7 VC is not set properly.** Use \`/247\` to fix this.`),
      ],
    });
  }

  // 🛑 Server mute check
  if (botMember.voice?.serverMute) {
    player.pause(true);
    return textChannel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(client.color)
          .setDescription(`<:floovi_warn:1382779289858211880> I'm **server muted**, so I've paused the music. Please unmute me to resume playback.`),
      ],
    });
  }
};