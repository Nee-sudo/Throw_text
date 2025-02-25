const mongoose = require("mongoose");

const textSchema = new mongoose.Schema({
  content: String,
});

module.exports = mongoose.model("Text", textSchema);
