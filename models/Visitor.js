const mongoose = require("mongoose");

const visitorSchema = new mongoose.Schema({
  ip: String,
  visits: { type: Number, default: 1 },
  lastVisit: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Visitor", visitorSchema);
