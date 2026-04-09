const mongoose = require("mongoose");

const roleBackupSchema = new mongoose.Schema({
  roleId: String,
  guildId: String,
  members: [String],
  name: String,
  color: String,
  permissions: String
});

module.exports = mongoose.model("RoleBackup", roleBackupSchema);
