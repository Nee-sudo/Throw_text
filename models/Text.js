const mongoose = require("mongoose");

const textSchema = new mongoose.Schema({
  content: { type: String, required: true },
  dateTime: { type: Date, required: true },
  serialNumber: { type: Number, required: true },
});

textSchema.index({ dateTime: -1 });
textSchema.index({ serialNumber: -1 });

module.exports = mongoose.model("Text", textSchema);
