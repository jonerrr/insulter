const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  _id: String,
  profane: { type: Boolean, default: true },
  dm: { type: Boolean, default: true },
});

const user = mongoose.model("users", userSchema);

module.exports = user;
