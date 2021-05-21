const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("../config.json");
const presenceList = require("./presences");

let presences = [];

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
  client.user.setStatus("idle");
  client.user.setPresence({
    status: "idle",
    activity: {
      name: `ur mom`,
      type: "WATCHING",
    },
  });
});

client.on("message", async (message) => {
  try {
    if (message.author.bot) return;

    if (message.content.includes("!insult")) {
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

client.login(config.token);
