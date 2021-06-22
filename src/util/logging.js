const chalk = require("chalk");

const warningColor = chalk.bold.yellow;
const errorColor = chalk.bold.red;
const infoColor = chalk.bold.blue;

const warning = (message) => {
  console.log(warningColor(message));
};

const error = (message) => {
  console.log(errorColor(message));
};

const info = (message) => {
  console.log(infoColor(message));
};

module.exports = { warning, error, info };
