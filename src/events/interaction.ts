import { info, error } from "./../util/discord/embed";
import {
  SnowflakeUtil,
  BaseCommandInteraction,
  Collection,
  Message,
} from "discord.js";
import { createMeme } from "../util/queries";

/**
 * Parse and execute a command.
 * @param BaseCommandInteraction Interaction with the command to execute.
 * @param number The amount of guilds the bot is in, used in info command.
 */
export const parseCommand = async (
  interaction: BaseCommandInteraction,
  servers: number
) => {
  try {
    switch (interaction.commandName) {
      case "info":
        await interaction.deferReply();
        return await interaction.reply({
          embeds: [
            info(
              SnowflakeUtil.deconstruct(interaction.id).timestamp - Date.now(),
              servers
            ),
          ],
        });

      // Submit a meme for insulter
      case "submit":
        await interaction.deferReply();

        //@ts-ignore
        const messages: Promise<Collection<string, Message<boolean>>> =
          await interaction.channel.messages.fetch();
        console.log(messages);
        //@ts-ignore
        const messagesSorted = messages.sort(
          (a: Message, b: Message) => b.createdTimestamp - a.createdTimestamp
        );
        const lastMessage1 = [];
        // Get the last attachment that is in the message content
        for (const m of messagesSorted)
          if (m.content.match(/(https?:\/\/.*\.(?:png|jpg|gif|mp4))/i)) {
            lastMessage1.push(
              m.content.match(/(https?:\/\/.*\.(?:png|jpg|gif|mp4))/i)
            );
            lastMessage1.push(m.createdTimestamp);
            break;
          }

        // Get the last attachment in message attachments
        const lastMessage: Message = messagesSorted
          .filter((m: Message) => m.attachments.size > 0)
          .first();

        const url = lastMessage.attachments[0].url;
        console.log(url, lastMessage1);
        console.log(lastMessage.createdTimestamp);

        const data = createMeme(
          interaction.options.get("status").value as string,
          "https://ok.com",
          interaction.user.id
        );
        await interaction.reply({ embeds: [] });
        break;
      case "insult":
        if (!interaction.inGuild())
          return await interaction.reply({
            embeds: [error("You can't run this command here")],
          });
      default:
        break;
    }
  } catch (e) {
    console.log(e);
  }
};

/**
 * Parse and execute a button. Button can be for confirming memes and approving / denying memes.
 * @param BaseCommandInteraction The button interaction.
 * @returns An array of links found in the supplied messages.
 */
export const parseButton = async (interaction: BaseCommandInteraction) => {};
