const mongoose = require("mongoose");
require("dotenv").config();

const mongoURI =
  process.env.MONGO_URI ||
  "mongodb+srv://neer:bjFBXFCYd00Gifiv@pdf-uploading-site.ges8oic.mongodb.net/?retryWrites=true&w=majority"; // MongoDB URI

async function connectDB() {
  try {
    await mongoose.connect(mongoURI);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}

module.exports = connectDB;
