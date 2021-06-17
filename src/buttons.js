const { MessageActionRow, MessageButton } = require("discord.js");

const confirm = (submitter) => {
  return new MessageActionRow().addComponents(
    new MessageButton()
      .setCustomID(`pg ${submitter}`)
      .setLabel(`Submit`)
      .setStyle("PRIMARY"),
    new MessageButton()
      .setCustomID(`pg13 ${submitter}`)
      .setLabel("Submit (Profane)")
      .setStyle("SECONDARY"),
    new MessageButton()
      .setCustomID("cancel")
      .setLabel("Cancel")
      .setStyle("DANGER")
  );
};

const confirm2 = (chose) => {
  return new MessageActionRow().addComponents(
    new MessageButton()
      .setCustomID(`pg clicked`)
      .setDisabled(true)
      .setLabel(`Submit`)
      .setStyle(chose === "pg" ? "PRIMARY" : "SECONDARY"),
    new MessageButton()
      .setCustomID(`pg13 clicked`)
      .setDisabled(true)
      .setLabel("Submit (Profane)")
      .setStyle(chose === "pg13" ? "PRIMARY" : "SECONDARY"),
    new MessageButton()
      .setCustomID(`cancel clicked`)
      .setDisabled(true)
      .setLabel("Cancel")
      .setStyle(chose === "cancel" ? "PRIMARY" : "SECONDARY")
  );
};

const review = (id) => {
  return new MessageActionRow().addComponents(
    new MessageButton()
      .setCustomID(`confirm ${id}`)
      .setLabel(`Confirm`)
      .setStyle("SUCCESS"),
    new MessageButton()
      .setCustomID(`deny ${id}`)
      .setLabel("Deny")
      .setStyle("DANGER")
  );
};

const review2 = (chose) => {
  return new MessageActionRow().addComponents(
    new MessageButton()
      .setCustomID(`confirmed clicked`)
      .setDisabled(true)
      .setLabel(`Confirm`)
      .setStyle(chose ? "PRIMARY" : "SECONDARY"),
    new MessageButton()
      .setCustomID(`deny clicked`)
      .setDisabled(true)
      .setLabel("Deny")
      .setStyle(chose ? "SECONDARY" : "PRIMARY")
  );
};

module.exports = { confirm, confirm2, review, review2 };
