const servers = require("./models/servers");
const config = require("../config.json");
const mongoose = require("mongoose");

const main = async () => {
  mongoose.connect(config.uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const serverData = await servers.find();
  for (const server of serverData) {
    server.dm = false;
    console.log(server);
    await servers.updateOne({ _id: server._id }, server);
  }
};

main();
