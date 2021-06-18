const { nanoid } = require("nanoid");
const Discord = require("discord.js");

const buttons = require("./buttons");
const presence = require("./models/presences");
const servers = require("./models/servers");
const config = require("../config.json");

const checkServer = async (id) => {
  const server = await servers.findById(id);

  return [server.profane, server.ping, server.dm];
};

const checkDM = async (id, client) => {
  const serverData = await servers.find({ dm: true });

  for (const server of serverData) {
    const guild = await client.guilds.cache.get(server._id);
    const member = await guild.members.cache.get(id);

    // return [!!member, server._id];
    return false;
  }
};

const getReply = async (message, admin) => {
  let presences = [];
  //TODO don't fetch server every time

  const members = await message.guild.members.fetch();

  members.forEach(async (member) => {
    for (const activity of member.presence.activities) {
      if (activity.type === "CUSTOM_STATUS" || activity.name === "Spotify")
        continue;

      presences.push({
        status: activity.name,
        id: member.user.id,
        tag: member.user.tag,
      });
    }
  });

  presences = presences
    .map((a) => ({ sort: Math.random(), value: a }))
    .sort((a, b) => a.sort - b.sort)
    .map((a) => a.value);

  const sent = false;
  for (const presenceData of presences) {
    if (!admin) {
      const memes = await fetchPresence(
        presenceData.status.toLowerCase(),
        message.guild.id
      );

      if (memes[0].length) {
        return message.channel.send(
          `${memes[1] ? `<@${presenceData.id}>` : presenceData.tag}, ${
            memes[0][Math.floor(Math.random() * memes[0].length)]
          }`
        );
        sent = true;
      }
    }
  }
  if (!sent)
    return message.channel.send(
      new Discord.MessageEmbed().setTitle(
        "error".setDescription("No insults found.")
      )
    );
};

const fetchPresence = async (name, server) => {
  const presenceData = await presence.findOne({ name });
  if (!presenceData || !presenceData.memes.length) return [[], null];
  const serverData = await checkServer(server);

  const memes = [];

  presenceData.memes.forEach((m) => {
    if (!serverData[0] && m.profane) return;
    memes.push(m.meme);
  });

  return [memes, serverData[1]];
};

const verifyPresence = async (name, meme) => {
  const presenceData = await presence.findOne({ name });

  if (!presenceData) return null;

  for (const meme1 of presenceData.memes) if (meme1 === meme) return null;

  return presenceData;
};

const approvePresence = async (name, id) => {
  const presenceData = await presence.findOne({ name });

  for (i = 0; i < presenceData.memes.length; i++) {
    if (presenceData.memes[i].id === id) {
      presenceData.memes[i].approved = true;
      break;
    }
  }

  await presence.updateOne({ _id: presenceData._id }, presenceData);
};

const denyPresence = async (name, id) => {
  try {
    const presenceData = await presence.findOne({ name });

    for (i = 0; i < presenceData.memes.length; i++)
      if (presenceData.memes[i].id === id) presenceData.memes.splice(i, 1);

    await presence.updateOne({ _id: presenceData._id }, presenceData);
  } catch (e) {
    console.log(e);
  }
};

const addPresence = async (name, profane, submitter, meme, client) => {
  const presenceData = await presence.findOne({ name });

  for (const m of presenceData.memes) if (m.meme === meme) return false;

  const id = nanoid();

  presenceData.memes.push({
    id,
    meme,
    approved: false,
    profane,
    submitter,
    submittedAt: Date.now(),
  });

  await presence.updateOne({ _id: presenceData._id }, presenceData);

  const channel = await client.channels.cache.get(config.channel);

  await channel.send({
    embed: new Discord.MessageEmbed()
      .setTitle("Meme submitted")
      .setDescription(
        `**Game**: ${name}\n**Submitter**: <@${submitter}>\n**Profane**: ${profane}`
      )
      .setImage(meme),

    components: [buttons.review(id)],
  });

  return true;
};

const combineActivities = (activities) => {
  const activityArray = [];

  activities.forEach((activity) =>
    activityArray.push(activity.name.toLowerCase())
  );

  return activityArray;
};

const addActivity = async (activity) => {
  if (activity === "spotify" || activity === "custom status") return;

  const presenceCheck = await presence.findOne({ name: activity });
  if (presenceCheck) return;

  await new presence({
    name: activity.toLowerCase(),
    memes: [],
  }).save();
};

module.exports = {
  getReply,
  verifyPresence,
  denyPresence,
  addPresence,
  fetchPresence,
  approvePresence,
  combineActivities,
  addActivity,
  checkServer,
  checkDM,
};
