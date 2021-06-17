const servers = require("../models/servers");

const join = async (id) => {
  if (await check(id)) return;

  await new servers({
    _id: id,
  }).save();
};

const check = async (id) => {
  const serverData = await servers.findOne({ _id: id });

  return serverData;
};

module.exports = { join, check };
