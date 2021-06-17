const mongoose = require("mongoose");
const urlRegexSafe = require("url-regex-safe");
const Discord = require("discord.js");
const client = new Discord.Client({
  intents: [
    "GUILDS",
    "GUILD_MESSAGES",
    "GUILD_PRESENCES",
    "GUILD_MESSAGE_REACTIONS",
  ],
});
const log = require("./logging");
const config = require("../config.json");

const guild = require("./guild");
const cooldown = require("./cooldown");
const presences = require("./presences");
const guildJoin = require("./events/guild");
const misc = require("./events/misc");
const buttons = require("./buttons");

const login = (mode) => {
  process.title = "Insulter";
  client.login(mode ? config.devToken : config.token);
  mongoose.connect(config.uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  log.info("Connected to database");
};

const equals = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);

client.on("ready", () => {
  log.info(
    `Logged in as ${client.user.tag}\nMode: ${config.dev ? "DEV" : "PROD"}`
  );

  client.user.setStatus("idle");
  client.user.setPresence({
    status: "idle",
    activity: {
      name: `your status 😼`,
      type: "WATCHING",
    },
  });
});

client.on("guildCreate", async (newGuild) => {
  log.info(`Joined guild: ${newGuild.name}`);

  await guildJoin.join(newGuild.id);
});

client.on("presenceUpdate", (oldPresence, newPresence) => {
  const activityArray = presences.combineActivities(newPresence.activities);

  if (typeof oldPresence !== "undefined") {
    const oldActivityArray = presences.combineActivities(
      oldPresence.activities
    );

    if (equals(activityArray, oldActivityArray)) return;
  }

  activityArray.forEach(
    async (activity) => await presences.addActivity(activity)
  );
});

client.on("interaction", async (interaction) => {
  if (
    !interaction.isMessageComponent() &&
    interaction.componentType !== "BUTTON"
  )
    return;

  if (interaction.customID.split(" ")[0] === "pg") {
    return (await presences.addPresence(
      interaction.message.embeds[0].description.slice(10),
      false,
      interaction.customID.slice(3),
      interaction.message.embeds[0].image.url,
      client
    ))
      ? interaction.update({
          embeds: [new Discord.MessageEmbed().setTitle("Meme Submitted")],
          components: [buttons.confirm2(interaction.customID.split(" ")[0])],
        })
      : interaction.update({
          embeds: [
            new Discord.MessageEmbed()
              .setTitle("Error")
              .setDescription("This meme has already been submitted."),
          ],
          components: [buttons.confirm2(interaction.customID.split(" ")[0])],
        });
  }

  if (interaction.customID.split(" ")[0] === "pg13") {
    return (await presences.addPresence(
      interaction.message.embeds[0].description.slice(10),
      true,
      interaction.customID.slice(5),
      interaction.message.embeds[0].image.url,
      client
    ))
      ? interaction.update({
          embeds: [new Discord.MessageEmbed().setTitle("Meme Submitted")],
          components: [buttons.confirm2(interaction.customID.split(" ")[0])],
        })
      : interaction.update({
          embeds: [
            new Discord.MessageEmbed()
              .setTitle("Error")
              .setDescription("This meme has already been submitted."),
          ],
          components: [buttons.confirm2(interaction.customID.split(" ")[0])],
        });
  }

  if (interaction.customID.split(" ")[0] === "cancel") {
    interaction.update({
      embeds: [new Discord.MessageEmbed().setTitle("Submission Canceled")],
      components: [buttons.confirm2(interaction.customID.split(" ")[0])],
    });
  }

  if (interaction.customID.split(" ")[0] === "confirm") {
    const submitInfo = interaction.message.embeds[0].description.split("\n");
    await presences.approvePresence(
      submitInfo[0].slice(10),
      interaction.customID.split(" ")[1]
    );

    return interaction.update({
      embeds: [
        new Discord.MessageEmbed()
          .setTitle("Submission Confirmed")
          .setImage(interaction.message.embeds[0].image.url),
      ],
      components: [buttons.review2(true)],
    });
  }

  if (interaction.customID.split(" ")[0] === "deny") {
    await presences.denyPresence(
      interaction.message.embeds[0].description.slice(10, 18),
      interaction.customID.split(" ")[1]
    );

    return interaction.update({
      embeds: [
        new Discord.MessageEmbed()
          .setTitle("Submission Denied")
          .setImage(interaction.message.embeds[0].image.url),
      ],
      components: [buttons.review2(false)],
    });
  }
});

client.on("message", async (message) => {
  //TODO for a bit check every guild per message to see if they are in the database
  if (message.author.bot) return;

  misc(message, client.user.id);

  if (!message.content.startsWith(config.prefix)) return;
  const commandBody = message.content.slice(config.prefix.length);
  const args = commandBody.split(" ");
  const command = args.shift();

  if (command === "submit" && args.length > 1) {
    const args2 = args.join(" ").split("; ");

    // if (!args[1].match(urlRegexSafe()))
    //   return message.channel.send({
    //     embed: new Discord.MessageEmbed()
    //       .setTitle("Error")
    //       .setDescription("Invalid URL Provided."),
    //   });

    if (!(await presences.verifyPresence(args2[0], args2[1])))
      return message.channel.send({
        embed: new Discord.MessageEmbed()
          .setTitle("Error")
          .setDescription(
            "This game has not been detected by the bot or this meme has already been submitted.\nIf this game exists, it will automatically be added to the presence database when you play it."
          ),
      });

    message.channel.send({
      embed: new Discord.MessageEmbed()
        .setTitle("Submit Meme?")
        .setDescription(`**Game**: ${args2[0]}`)
        .setImage(args2[1]),

      components: [buttons.confirm(message.author.id)],
    });

    cooldown.submit.add(message.author.id);

    setTimeout(() => {
      cooldown.submit.delete(message.author.id);
    }, 5000);
  }

  if (command === "ping" && message.member.permissions.has("MANAGE_GUILD"))
    message.channel.send({
      embed: new Discord.MessageEmbed()
        .setTitle("Success")
        .setDescription(
          `**Ping Users**: ${await guild.updatePing(message.guild.id)}`
        ),
    });

  if (command === "profane" && message.member.permissions.has("MANAGE_GUILD"))
    message.channel.send({
      embed: new Discord.MessageEmbed()
        .setTitle("Success")
        .setDescription(
          `**Profane Memes**: ${await guild.updateProfane(message.guild.id)}`
        ),
    });

  if (command === "insultr" || command === "ir")
    return await presences.getReply(message);

  if (command === "insult") presences.getReply(message, true);

  if (command === "help") {
    return message.channel.send({
      embed: new Discord.MessageEmbed()
        .setTitle("Help")
        .setDescription(
          `**Servers**: ${client.guilds.cache.size}\n[Invite](https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=0&scope=bot)\n\n=====Commands=====`
        )
        .addFields(
          {
            name: `${config.prefix}ir || ${config.prefix}insultr`,
            value: "Insult a random person",
          },
          {
            name: config.prefix + "submit `<Game>`; `<Meme URL>`",
            value: "Suggest an insult",
          },
          // {
          //   name: config.prefix + "info",
          //   value: "More information about this bot",
          // },
          {
            name: "\u200B",
            value: "\u200B",
          },
          {
            name: "Admin Only ",
            value: "These commands can only be ran by server administrators",
          },
          // {
          //   name: "\u200B",
          //   value: "\u200B",
          // },
          // {
          //   name: config.prefix + "insult",
          //   value:
          //     "Insult as many people as possible (may cause spam in huge servers)",
          // },
          {
            name: config.prefix + "ping",
            value: "Enable/Disable if users will be pinged when insulted",
          },
          {
            name: config.prefix + "profane",
            value: "Enable/Disable if bot will post profane memes",
          }
        ),
    });
  }
});

login(config.dev);

//TODO make dm insults admin only
//TODO make admin system
//TODO cooldown on insultrs
