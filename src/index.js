const mongoose = require("mongoose");
const urlRegexSafe = require("url-regex-safe");
const Discord = require("discord.js");
const client = new Discord.Client({
  intents: [
    "GUILDS",
    "GUILD_MESSAGES",
    "GUILD_PRESENCES",
    "GUILD_MESSAGE_REACTIONS",
    "GUILD_MEMBERS",
  ],
});
const log = require("./util/logging");
const config = require("../config.json");

const guild = require("./util/guild");
const cooldown = require("./util/cooldown");
const presences = require("./util/presences");
const guildJoin = require("./events/guild");
const misc = require("./events/misc");
const buttons = require("./util/buttons");
const user = require("./util/user");

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

const userCache = {};

client.on("presenceUpdate", async (oldPresence, newPresence) => {
  const activityArray = presences.combineActivities(newPresence.activities);

  if (typeof oldPresence !== "undefined") {
    const oldActivityArray = presences.combineActivities(
      oldPresence.activities
    );

    if (equals(activityArray, oldActivityArray)) return;
  }

  try {
    for (const activity of activityArray) {
      await presences.addActivity(activity);
      const shouldDM = await presences.checkDM(newPresence.userID, client);
      if (
        shouldDM[0] &&
        (!userCache[newPresence.userID] ||
          userCache[newPresence.userID] < Date.now())
      ) {
        userCache[newPresence.userID] = Date.now() + 3600000;
        const memes = await presences.fetchPresence(activity, shouldDM[1]);
        if (!memes[0].length) return;
        console.log(newPresence.userID, activity);
        const userData = await user.checkUser(newPresence.userID);
        console.log(userData);
        // if (!userData.dm) return;

        client.users.cache.get(newPresence.userID).send({
          content: memes[0][Math.floor(Math.random() * memes[0].length)],
          // components: [buttons.dm(newPresence.userID)],
        });
        break;
      }
    }
  } catch (e) {
    log.error(e);
  }
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

  // if (interaction.customID.split(" ")[0] === "dm") {
  //   await user.updateUser(interaction.customID.split(" ")[1], true)
  // }
});

client.on("message", async (message) => {
  //TODO for a bit check every guild per message to see if they are in the database
  if (message.author.bot) return;

  misc(message, client.user.id);

  if (!message.content.startsWith(config.prefix)) return;

  const commandBody = message.content.slice(config.prefix.length).toLowerCase();
  const args = commandBody.split(" ");
  const command = args.shift();

  if (command === "list") {
    const listEmbed = new Discord.MessageEmbed().setTitle("Meme List");

    const memeData = await presences.getAllMemes();
    let memeStr = "";
    memeData.forEach(
      (m) => (memeStr = `${memeStr} **${m.name}**: ${m.count}\n\n`)
    );

    listEmbed.setDescription(
      "You can always submit memes with: " +
        config.prefix +
        "submit `Game`; `Meme URL`\n\n" +
        memeStr
    );

    return message.channel.send({ embed: listEmbed });
  }

  if (command === "submit" && args.length > 1) {
    try {
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

      if (cooldown.submit.has(message.author.id))
        return message.channel.send({
          embed: new Discord.MessageEmbed()
            .setTitle("Error")
            .setDescription("You are on cooldown."),
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
    } catch (e) {
      console.log(e);
      message.channel.send({
        embed: new Discord.MessageEmbed()
          .setTitle("Error")
          .setDescription("```" + e + "```"),
      });
    }
  }

  if (
    command === "ping" &&
    (message.member.permissions.has("MANAGE_GUILD") ||
      message.author.id === "781599562388471819")
  )
    message.channel.send({
      embed: new Discord.MessageEmbed()
        .setTitle("Success")
        .setDescription(
          `**Ping Users**: ${await guild.updatePing(message.guild.id)}`
        ),
    });

  if (
    command === "profane" &&
    (message.member.permissions.has("MANAGE_GUILD") ||
      message.author.id === "781599562388471819")
  )
    message.channel.send({
      embed: new Discord.MessageEmbed()
        .setTitle("Success")
        .setDescription(
          `**Profane Memes**: ${await guild.updateProfane(message.guild.id)}`
        ),
    });

  if (command === "dm" && message.author.id === "781599562388471819")
    message.channel.send({
      embed: new Discord.MessageEmbed()
        .setTitle("Success")
        .setDescription(
          `**DM Users**: ${await guild.updateDM(message.guild.id)}`
        ),
    });

  if (
    command === "insultr" ||
    (command === "ir" && !cooldown.insultRandom.has(message.author.id))
  )
    return await presences.getReply(message);

  if (
    (command === "insult" || command === "i") &&
    !cooldown.insultRandom.has(message.author.id)
  ) {
    if (message.mentions.users.first()) {
      message.guild.presences.cache.forEach(async (p) => {
        if (p.userID === message.mentions.users.first().id) {
          for (const activity of p.activities
            .map((a) => ({ sort: Math.random(), value: a }))
            .sort((a, b) => a.sort - b.sort)
            .map((a) => a.value)) {
            const meme = await presences.fetchPresence(
              activity.name.toLowerCase(),
              message.guild.id
            );
            if (!meme[0].length) return;

            cooldown.insultRandom.add(message.author.id);
            setTimeout(() => {
              cooldown.insultRandom.delete(message.author.id);
            }, 500);

            return message.channel.send({
              content: meme[0][Math.floor(Math.random() * meme[0].length)],
            });
          }
        }
      });
    }

    const args2 = commandBody.split(" ");
    args2.shift();
    if (args2.join(" ")) {
      const memes = await presences.fetchPresence(
        args2.join(" ").toLowerCase(),
        message.guild.id
      );
      if (memes[0].length)
        return message.channel.send(
          memes[0][Math.floor(Math.random() * memes[0].length)]
        );
    }
  }

  if (command === "help") {
    const msg = await message.channel.send({
      embed: new Discord.MessageEmbed().setTitle("Loading"),
    });
    const serverData = await presences.checkServer(message.guild.id);

    const helpEmbed = new Discord.MessageEmbed()
      .setTitle("Help")
      .setDescription(
        `**Servers**: ${client.guilds.cache.size}\n**Ping**: ${
          msg.createdTimestamp - message.createdTimestamp
        }ms\n[Invite](https://discord.com/oauth2/authorize?client_id=${
          client.user.id
        }&permissions=0&scope=bot)\n\n=====Commands=====`
      )
      .addFields(
        {
          name: `${config.prefix}ir || ${config.prefix}insultr`,
          value: "Insult a random person",
        },
        {
          name:
            `${config.prefix}i || ${config.prefix}insult ` +
            "`Game/<@Mention>`",
          value: "Insult a specific person or game",
        },
        {
          name: config.prefix + "submit `Game`; `Meme URL`",
          value: "Suggest an insult",
        },
        {
          name: config.prefix + "list",
          value: "List memes",
        },
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
          value: `Enable/Disable if users will be pinged when insulted. Currently, it **will ${
            serverData[1] ? "" : "not"
          }** ping users.`,
        },
        {
          name: config.prefix + "profane",
          value: `Enable/Disable if bot will post profane memes. Currently, it **will ${
            serverData[0] ? "" : "not"
          }** post profane memes.`,
        }
      );
    if (message.author.id === "781599562388471819")
      helpEmbed.addField(
        `${config.prefix}dm`,
        `Enable/Disable if bot will DM people on presence change with insults. Currently, it **will ${
          serverData[2] ? "" : "not"
        }** DM people.`
      );

    return await msg.edit({
      embed: helpEmbed,
    });
  }
});

login(config.dev);

//TODO make admin system
//TOOD cache system so same insults dont get used and same people dont get pinged
//TODO force submit system for admins
//TODO cooldown on insultrs
