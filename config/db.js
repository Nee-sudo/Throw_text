const mongoose = require("mongoose");
require("dotenv").config();

const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error("MONGO_URI is not set");
}

// Reuse the connection across serverless invocations instead of
// reconnecting on every cold start (the actual fix for the race condition).
let cached = global._mongooseConn;
if (!cached) {
  cached = global._mongooseConn = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(mongoURI, {
        serverSelectionTimeoutMS: 5000, // fail fast instead of hanging 10s+
        maxPoolSize: 10,
      })
      .then((m) => {
        console.log("MongoDB connected");
        return m;
      })
      .catch((err) => {
        cached.promise = null; // allow retry on next request if it failed
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = connectDB;
