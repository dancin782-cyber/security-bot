const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = [
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check bot ping"),

  new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Ban a user")
    .addUserOption(option =>
      option.setName("user").setDescription("User to ban").setRequired(true)
    )
    .addStringOption(option =>
      option.setName("reason").setDescription("Reason")
    ),

  new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a user")
    .addUserOption(option =>
      option.setName("user").setDescription("User to kick").setRequired(true)
    )
];
