const mongoose = require("mongoose");

const serverSchema = new mongoose.Schema({
  _id: String,
  profane: { type: Boolean, default: true },
  ping: { type: Boolean, default: true },
  dm: { type: Boolean, default: false },
});

const server = mongoose.model("servers", serverSchema);

module.exports = server;
