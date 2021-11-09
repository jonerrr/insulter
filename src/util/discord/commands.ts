import { SlashCommandBuilder } from "@discordjs/builders";

export const commands = [
  new SlashCommandBuilder()
    .setName("insult")
    .setDescription("Insult someone")
    .addMentionableOption((option) =>
      option
        .setName("user")
        .setDescription(
          "Specific person to insult, if nobody is provided it will be random"
        )
    ),
  ,
  new SlashCommandBuilder()
    .setName("info")
    .setDescription("More information about this bot."),
  new SlashCommandBuilder()
    .setName("submit")
    .setDescription("Submit a meme, the first image / video / gif is selected.")
    .addStringOption((option) =>
      option
        .setName("status")
        .setDescription(
          "The status this status is related to (like a game or song)"
        )
        .setRequired(true)
    ),
].map((command) => command.toJSON());
