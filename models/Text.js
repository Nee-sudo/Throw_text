const mongoose = require("mongoose");

const textSchema = new mongoose.Schema({
  content: { type: String, required: true },
  dateTime: { type: Date, required: true },
  serialNumber: { type: Number, required: true },
});

module.exports = mongoose.model("Text", textSchema);
