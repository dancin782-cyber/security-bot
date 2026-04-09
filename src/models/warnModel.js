const mongoose = require("mongoose");

const warnSchema = new mongoose.Schema({
  userId: String,
  guildId: String,
  warnings: [
    {
      reason: String,
      date: { type: Date, default: Date.now }
    }
  ]
});

module.exports = mongoose.model("Warn", warnSchema);
