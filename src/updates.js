const fs = require("fs");

const updateUser = (id, update) => {
  const data = JSON.parse(fs.readFileSync("./users.json"));

  data[id] = [update, Date.now() + 1800000];

  fs.writeFileSync("./users.json", JSON.stringify(data));
};

const checkUser = (id) => {
  const data = JSON.parse(fs.readFileSync("./users.json"));

  if (!data[id]) return true;

  if (typeof data[id][0] === "undefined") return true;

  if (data[id][0] && data[id][1] < Date.now()) return true;

  return false;
};

const addPresence = (game, meme) => {
  const data = JSON.parse(fs.readFileSync("./presences.json"));

  data[game] ? data[game].push(meme) : (data[game] = [meme]);

  fs.writeFileSync("./presences.json", JSON.stringify(data));
};

const getPresences = () => {
  const data = JSON.parse(fs.readFileSync("./presences.json"));

  return data;
};

module.exports = { checkUser, updateUser, addPresence, getPresences };
