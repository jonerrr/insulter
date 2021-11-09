import { MessageEmbed } from "discord.js";

export const memeCreated = (url: string): MessageEmbed =>
  new MessageEmbed().setTitle("Meme submitted").setColor("GREEN").setImage(url);

export const info = (ping: number, servers: number): MessageEmbed =>
  new MessageEmbed()
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

export const error = (error: string): MessageEmbed =>
  new MessageEmbed()
    .setTitle("Error")
    .setColor("DARK_RED")
    .setDescription(error);
