import { info, error, memeCreated } from "./../util/discord/embed";
import {
  SnowflakeUtil,
  BaseCommandInteraction,
  Collection,
  Message,
} from "discord.js";
import { createMeme } from "../util/queries";

const regex: RegExp = new RegExp(/(https?:\/\/[^ ]*)/);

/**
 * Parse and execute a command.
 * @param BaseCommandInteraction Interaction with the command to execute.
 * @param number The amount of guilds the bot is in, used in info command.
 */
export const parseCommand = async (
  interaction: BaseCommandInteraction,
  servers: number
) => {
  switch (interaction.commandName.toLowerCase()) {
    case "info":
      await interaction.deferReply();
      return await interaction.editReply({
        embeds: [
          info(
            SnowflakeUtil.deconstruct(interaction.id).timestamp - Date.now(),
            servers
          ),
        ],
      });

    // Submit a meme for insulter
    case "submit":
      try {
        //@ts-ignore
        const messages: Promise<Collection<string, Message<boolean>>> =
          await interaction.channel.messages.fetch();
        //@ts-ignore
        const messagesSorted = messages.sort(
          (a: Message, b: Message) => b.createdTimestamp - a.createdTimestamp
        );

        const lastMessage1 = [];
        // Get the last attachment that is in the message content
        for (const m of messagesSorted.values())
          if (m.content.match(regex)) {
            lastMessage1.push(m.content.match(regex)[0]);
            lastMessage1.push(m.createdTimestamp);
            break;
          }

        // Get the last attachment in message attachments
        const lastMessage: Message = messagesSorted
          .filter((m: Message) => m.attachments.size > 0)
          .first();

        const url = lastMessage.attachments.first().url;

        if (!url && lastMessage1.length !== 2)
          throw new Error("No attachment found.");

        let latestAttachment: string = url;
        if (lastMessage1.length === 2)
          latestAttachment =
            lastMessage1[1] > lastMessage.createdTimestamp
              ? lastMessage1[0]
              : url;

        await createMeme(
          interaction.options.get("status").value as string,
          latestAttachment,
          interaction.user.id
        );
        await interaction.reply({
          embeds: [memeCreated(latestAttachment)],
        });
      } catch (e) {
        await interaction.reply({ embeds: [error(e.message)] });
      }
    case "insult":
      if (!interaction.inGuild())
        return await interaction.reply({
          embeds: [error("You can't run this command here")],
        });
    default:
      break;
  }
};

/**
 * Parse and execute a button. Button can be for confirming memes and approving / denying memes.
 * @param BaseCommandInteraction The button interaction.
 */
export const parseButton = async (interaction: BaseCommandInteraction) => {};
