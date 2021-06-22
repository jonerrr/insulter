const user = require("../models/user");

const checkUser = async (id) => {
  const userData = await user.findOne({ _id: id });
  if (userData) return userData;

  await new user({
    _id: id,
  }).save();

  return {
    profane: true,
    dm: true,
  };
};

const updateUser = async (id, profane, dm) => {
  await user.updateOne({ _id: id }, { profane, dm });
};

module.exports = { checkUser, updateUser };
