const guild = require("./guild");
const phrases = [
  "shut the fuck up",
  "you're*",
  "please stop talking",
  "i dont care",
  "who asked +ratio",
];
const addedGuilds = [];

const misc = async (message, id) => {
  if (!addedGuilds.includes(message.guild.id)) {
    await guild.join(message.guild.id);
    addedGuilds.push(message.guild.id);
  }

  const number = Math.floor(Math.random() * 1000);

  // if (message.mentions.users.first().id === id && number === 1) {
  //   console.log("ok");
  //   message.channel.send("https://tenor.com/view/discord-gif-19091877");
  // }
  if (number === 1)
    message.channel.send(phrases[Math.floor(Math.random() * phrases.length)]);
};

module.exports = misc;
