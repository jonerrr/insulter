const Discord = require("discord.js");
const client = new Discord.Client();
const disbut = require("discord-buttons")(client);
const config = require("../config.json");
const update = require("./updates");
let presenceList = require("../presences.json");

let presences = [];
const memes = {};

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
  client.user.setStatus("idle");
  client.user.setPresence({
    status: "idle",
    activity: {
      name: `your status`,
      type: "WATCHING",
    },
  });
});

const aboutButton = new disbut.MessageButton()
  .setStyle("blurple")
  .setLabel("About Me")
  .setID("about");

const stopButton = new disbut.MessageButton()
  .setStyle("red")
  .setLabel("Stop Insulting")
  .setID("stop");

const startButton = new disbut.MessageButton()
  .setStyle("green")
  .setLabel("Start Insulting")
  .setID("start");

client.on("presenceUpdate", (_, newPresence) => {
  try {
    presenceList = update.getPresences();

    if (!config.update) return;

    for (const presence of newPresence.activities) {
      if (presenceList[presence.name]) {
        if (!update.checkUser(newPresence.userID)) break;

        update.updateUser(newPresence.userID, true);

        console.log("guy");

        client.users.cache
          .get(newPresence.userID)
          .send(
            `${
              presenceList[presence.name][
                Math.floor(Math.random() * presenceList[presence.name].length)
              ]
            }`,
            {
              buttons: [aboutButton, startButton, stopButton],
            }
          );
      }
    }
  } catch (e) {
    console.log(e);
  }
});

client.on("message", async (message) => {
  try {
    if (message.author.bot) return;
    if (!message.content.startsWith(config.prefix)) return;

    const commandBody = message.content.slice(config.prefix.length);
    const args = commandBody.split(" ");
    const command = args.shift();

    if (command.toLowerCase() === "help") {
      return message.channel.send(
        new Discord.MessageEmbed().setTitle("Help").addFields(
          { name: ";insultr", value: "Insult a random person" },
          {
            name: ";suggest `<game (Case sensitive)>`,` <meme or text>`",
            value: "Suggest an insult",
          },
          {
            name: ";insult",
            value: "(Admin Only) Insult everyone whose status applies",
          },
          {
            name: ";stop",
            value: "(Admin Only) Disable insult commands",
          },
          {
            name: ";start",
            value: "(Admin Only) Enable insult commands",
          }
        )
      );
    }

    if (
      command.toLowerCase() === "stop" &&
      message.member.hasPermission("ADMINISTRATOR")
    ) {
      update.updateServer(message.guild.id, false);
      message.channel.send("Insult commands disabled in this server");
    }

    if (
      command.toLowerCase() === "start" &&
      message.member.hasPermission("ADMINISTRATOR")
    ) {
      update.updateServer(message.guild.id, true);
      message.channel.send("Insult commands enabled in this server");
    }

    if (command.toLowerCase() === "suggest") {
      const channel = client.channels.cache.get(config.channel);

      const args2 = args.join(" ").split(", ");

      if (args2.length !== 2)
        return message.channel.send(
          "Invalid Arguments. Usage: `!suggest game name (Case sensitive), https://linktomemeorgif.com/ or a phrase`"
        );

      memes[args2[1]] = args2[0];

      let approveButton = new disbut.MessageButton()
        .setStyle("green")
        .setLabel("Approve")
        .setID(args2[1]);

      await channel.send(
        new Discord.MessageEmbed()
          .setTitle("New Suggestion")
          .addField(args2[0], args2[1])
      );

      await channel.send("Approve this meme?", {
        buttons: [approveButton],
      });

      await message.channel.send("Meme Submitted");
    }

    if (
      command.toLowerCase() === "insultr" &&
      update.checkServer(message.guild.id)
    ) {
      const members = await message.guild.members.fetch();

      members.forEach((member) => {
        for (const activity of member.presence.activities) {
          const custom = activity.type === "CUSTOM_STATUS";

          presences.push({
            status: custom ? activity.state : activity.name,
            id: member.user.id,
          });
        }
      });

      const messages = [];

      for (const presence of presences) {
        if (presenceList[presence.status]) {
          messages.push(
            `<@${presence.id}>, ${
              presenceList[presence.status][
                Math.floor(Math.random() * presenceList[presence.status].length)
              ]
            }`
          );
        }
      }
      message.channel.send(
        messages[Math.floor(Math.random() * messages.length)]
      );
      presences = [];
    }

    if (
      command.toLowerCase() === "insult" &&
      update.checkServer(message.guild.id) &&
      message.member.hasPermission("ADMINISTRATOR")
    ) {
      const members = await message.guild.members.fetch();

      members.forEach((member) => {
        for (const activity of member.presence.activities) {
          const custom = activity.type === "CUSTOM_STATUS";

          presences.push({
            status: custom ? activity.state : activity.name,
            id: member.user.id,
          });
        }
      });

      for (const presence of presences) {
        if (presenceList[presence.status]) {
          message.channel.send(
            `<@${presence.id}>, ${
              presenceList[presence.status][
                Math.floor(Math.random() * presenceList[presence.status].length)
              ]
            }`
          );
        }
      }
      presences = [];
    }
  } catch (e) {
    console.log(e);
    message.channel.send("error");
  }
});

client.on("clickButton", async (button) => {
  if (button.id === "stop") {
    update.updateUser(button.clicker.user.id, false);

    return await button.reply.send(
      `I will no longer insult you, you can enable the insults again by clicking the start button.`
    );
  }

  if (button.id === "start") {
    update.updateUser(button.clicker.user.id, true);

    return await button.reply.send(
      `I will start insulting, you can disable the insults by clicking the stop button.`
    );
  }

  if (button.id === "about") {
    return await button.reply.send(
      "I am a bot that will insult you based off of your status, you can view my commands by running `;help` in a mutual server. \n You can invite me here: https://discord.com/oauth2/authorize?client_id=838209664897253386&permissions=0&scope=bot"
    );
  }

  update.addPresence(memes[button.id], button.id);

  return await button.reply.send(`Approved`);
});

client.login(config.token);
