const servers = require("./models/servers");

const updatePing = async (id) => {
  const server = await servers.findById(id);

  await servers.updateOne({ _id: id }, { ping: !server.ping });

  return !server.ping;
};

const updateProfane = async (id) => {
  const server = await servers.findById(id);

  await servers.updateOne({ _id: id }, { profane: !server.profane });

  return !server.profane;
};

module.exports = { updatePing, updateProfane };
