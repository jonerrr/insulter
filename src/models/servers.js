const mongoose = require("mongoose");

const serverSchema = new mongoose.Schema({
  _id: String,
  profane: { type: Boolean, default: true },
  ping: { type: Boolean, default: true },
});

const server = mongoose.model("servers", serverSchema);

module.exports = server;
