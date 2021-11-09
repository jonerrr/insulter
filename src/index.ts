import { Client, Intents, Presence, BaseCommandInteraction } from "discord.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { connect } from "mongoose";
import config from "../config.json";
import { parseCommand, parseButton } from "./events/interaction";
import { addPresence } from "./events/presence";
import { commands } from "./util/discord/commands";

const client: Client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_PRESENCES,
  ],
});
const rest = new REST({ version: "9" }).setToken(config.token);

client.on("ready", async () => {
  if ((config.mode === "dev" && !config.guild) || config.guild.length < 5) {
    console.log(
      `Missing guild for slash commands, currently set to ${config.guild}`
    );
    process.exit(1);
  }
  config.mode === "dev"
    ? await rest.put(
        Routes.applicationGuildCommands(client.user.id, config.guild),
        { body: commands }
      )
    : await rest.put(Routes.applicationCommands(client.user.id), {
        body: commands,
      });
  client.user.setActivity({
    type: "WATCHING",
    name: "your status",
  });
  console.log(
    `Logged in as ${client.user.username}\n${commands.length} ${
      config.mode === "dev" ? "guild" : "global"
    } commands registered\nMode: ${config.mode}`
  );
});

client.on("presenceUpdate", (oldP: Presence, newP: Presence) =>
  addPresence(oldP, newP)
);

client.on("interactionUpdate", (interaction: BaseCommandInteraction) => {
  if (interaction.isCommand())
    parseCommand(interaction, client.guilds.cache.size);

  if (interaction.isButton())
    parseButton(interaction);
});

client.login(config.token);
connect(config.uri);
