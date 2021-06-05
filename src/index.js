const Discord = require("discord.js");
const client = new Discord.Client();
const disbut = require("discord-buttons")(client);
const config = require("../config.json");
const update = require("./updates");
let presenceList = require("../presences.json");

process.title = "Insulter";

let presences = [];
const phrases = [
  "shut the fuck up",
  "wrong you're retard",
  "please stop talking",
  "i dont care",
  "who asked +ratio",
];
const memes = {};

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

const disableButton = new disbut.MessageButton()
  .setStyle("blurple")
  .setLabel("Approved")
  .setDisabled()
  .setID("ok");

const denyButton = new disbut.MessageButton()
  .setStyle("red")
  .setLabel("Deny")
  .setID("deny");

const denyButtonDisabled = new disbut.MessageButton()
  .setStyle("blurple")
  .setLabel("Denied")
  .setDisabled()
  .setID("deny");

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

client.on("presenceUpdate", (_, newPresence) => {
  try {
    presenceList = update.getPresences();

    if (!config.update) return;

    for (const presence of newPresence.activities) {
      if (presenceList[presence.name]) {
        if (!update.checkUser(newPresence.userID)) break;

        update.updateUser(newPresence.userID, true);

        console.log(
          `${new Date(Date.now()).toLocaleString()} ${newPresence.user.tag}`
        );

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
    console.log("error");
  }
});

client.on("message", async (message) => {
  try {
    if (message.author.bot) return;

    const number = Math.floor(Math.random() * 700);

    if (number === 69)
      await message.channel.send(
        phrases[Math.floor(Math.random() * phrases.length)]
      );

    if (!message.content.startsWith(config.prefix)) return;

    const commandBody = message.content.slice(config.prefix.length);
    const args = commandBody.split(" ");
    const command = args.shift();

    if (command.toLowerCase() === "help") {
      return message.channel.send(
        new Discord.MessageEmbed()
          .setTitle("Help")
          .setDescription(
            `**Servers**: ${
              client.guilds.cache.size
            } \n **Commands**: ${update.checkServer(
              message.guild.id
            )} \n [Invite](https://discord.com/oauth2/authorize?client_id=${
              client.user.id
            }&permissions=0&scope=bot)`
          )
          .addFields(
            { name: ";insultr", value: "Insult a random person" },
            {
              name: ";suggest `<Game name (case sensitive)>`, `<Meme URL or Message>`",
              value: "Suggest an insult",
            },
            {
              name: ";insult",
              value: "*Admin Only* | Insult everyone whose status applies",
            },
            {
              name: ";stop",
              value: "*Admin Only* | Disable insult commands",
            },
            {
              name: ";start",
              value: "*Admin Only* | Enable insult commands",
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
          "Invalid Arguments. Usage: `;suggest game name (Case sensitive), https://linktomemeorgif.com/ or a phrase`"
        );

      if (args[1].length > 100) message.channel.send("meme denied (its trash)");

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
        buttons: [approveButton, denyButton],
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
    message.channel.send("shut up");
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

  if (button.id === "deny") {
    return await button.message.edit("Meme Denied", {
      buttons: [disableButton, denyButtonDisabled],
    });
  }

  update.addPresence(memes[button.id], button.id);

  button.message.edit("Meme Approved", {
    buttons: [disableButton, denyButtonDisabled],
  });

  return button.defer();
});

client.login(config.token);
