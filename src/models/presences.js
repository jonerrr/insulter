const mongoose = require("mongoose");

const presenceSchema = new mongoose.Schema({
  name: String,
  memes: [
    {
      id: String,
      meme: String,
      approved: Boolean,
      profane: Boolean,
      submitter: String,
      submittedAt: Date,
    },
  ],
});

const presence = mongoose.model("presences", presenceSchema);

module.exports = presence;
