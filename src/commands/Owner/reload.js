const fs = require("fs");
const path = require("path");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "reload",
  aliases: ["r"],
  description: "Reload commands, events, handlers or specific files/folders",
  category: "Owner",
  owner: true,

  run: async (client, message, args) => {
    const input = args[0];
    if (!input) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.color)
            .setDescription(`<:floovi_cross:1382029455601569904> | Please specify what to reload.`),
        ],
      });
    }

    const rootDir = path.resolve(__dirname, "../../");

    const reply = (desc, emoji = "<:floovi_tick:1381965556277710860>") =>
      message.reply({
        embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${emoji} | ${desc}`)],
      });

    const errorReply = (name, err) =>
      message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(client.color)
            .setTitle(`<:floovi_cross:1382029455601569904> | Failed to reload: \`${name}\``)
            .setDescription(`\`\`\`js\n${err.stack || err.message}\n\`\`\``.slice(0, 4000)),
        ],
      });

    try {
      if (input === "commands") {
        client.commands.clear();
        client.aliases.clear();

        const commandPath = path.join(rootDir, "commands");

        const loadCommands = (dir) => {
          for (const file of fs.readdirSync(dir)) {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
              loadCommands(fullPath);
            } else if (file.endsWith(".js")) {
              delete require.cache[require.resolve(fullPath)];
              const cmd = require(fullPath);
              if (cmd?.name) {
                client.commands.set(cmd.name, cmd);
                if (cmd.aliases?.length) {
                  cmd.aliases.forEach((a) => client.aliases.set(a, cmd.name));
                }
              }
            }
          }
        };

        loadCommands(commandPath);
        return reply("Commands have been reloaded.");
      }

      if (input === "events") {
        const eventsPath = path.join(rootDir, "events");
        for (const file of fs.readdirSync(eventsPath)) {
          const eventName = file.split(".")[0];
          client.removeAllListeners(eventName);

          const fullPath = path.join(eventsPath, file);
          delete require.cache[require.resolve(fullPath)];
          const event = require(fullPath);
          client.on(eventName, event.bind(null, client));
        }

        return reply("Events have been reloaded.");
      }

      if (input === "handlers") {
        const handlerPath = path.join(rootDir, "handlers");
        for (const file of fs.readdirSync(handlerPath)) {
          const full = path.join(handlerPath, file);
          delete require.cache[require.resolve(full)];
          require(full)(client); // run handler function again
        }

        return reply("Handlers reloaded.");
      }

      // Reload a specific file or folder
      const targetPath = path.join(rootDir, input);
      if (fs.existsSync(targetPath)) {
        const stat = fs.statSync(targetPath);

        if (stat.isDirectory()) {
          for (const file of fs.readdirSync(targetPath)) {
            const full = path.join(targetPath, file);
            if (file.endsWith(".js") && fs.statSync(full).isFile()) {
              delete require.cache[require.resolve(full)];
              const loaded = require(full);
              // optional: if it exports a function, call it with client
              if (typeof loaded === "function") loaded(client);
            }
          }
          return reply(`Folder \`${input}\` reloaded.`);
        }

        if (stat.isFile() && input.endsWith(".js")) {
          delete require.cache[require.resolve(targetPath)];
          const loaded = require(targetPath);
          if (typeof loaded === "function") loaded(client);
          return reply(`File \`${input}\` reloaded.`);
        }
      }

      return reply(`Could not find file/folder: \`${input}\``, "<:floovi_cross:1382029455601569904>");
    } catch (err) {
      return errorReply(input, err);
    }
  },
};