import { MessageEmbed } from "discord.js";

export const info = (ping: number, servers: number): MessageEmbed => {
  return new MessageEmbed()
    .setTitle("Error")
    .setColor("DARK_BUT_NOT_BLACK")
    .setFields([
      {
        name: "Ping",
        value: `${ping}ms`,
        inline: false,
      },
      {
        name: "Servers",
        value: `${servers}`,
        inline: true,
      },
    ])
    .setDescription("Insulter is a very awesome Discord bot that insults you!");
};

export const error = (error: string): MessageEmbed => {
  return new MessageEmbed()
    .setTitle("Error")
    .setColor("DARK_RED")
    .setDescription(error);
};
