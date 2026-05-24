const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  title: String,
  message: String,
  ipAddress: String,
  country: String,
  region: String,
  city: String,
  createdAt: { type: Date, default: Date.now },
});

messageSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Message", messageSchema);
