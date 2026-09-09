const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();
const requestIp = require("request-ip");
const dns = require("dns");
dns.setServers(["1.1.1.1","8.8.8.8"]); // Ensure IPv4 is prioritized over IPv6
// Import Routes
const textRoutes = require("./routes/texts");
const messageRoutes = require("./routes/messages");
const visitorRoutes = require("./routes/visitors");

// Initialize App
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(requestIp.mw());

// Cache static assets for faster repeat visits (especially mobile)
app.use(
  express.static(path.join(__dirname, "public"), {
    maxAge: process.env.NODE_ENV === "production" ? "7d" : 0,
    etag: true,
  })
);

// Connect to DB
const connectDB = require("./config/db");

// Ensure every request waits for a ready MongoDB connection before hitting
// any route that touches the DB. This fixes the race condition where a
// cold serverless instance's connection was still negotiating while a
// query tried to run, causing "buffering timed out" errors under load.
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("DB connection failed:", err);
    res.status(503).send("Database unavailable, please retry.");
  }
});

// Routes
app.use("/api/texts", textRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/visitors", visitorRoutes);

// Serve Static Files
app.get("/google3634443e1c428dc1.html", (req, res) =>
  res.sendFile(path.join(__dirname, "google3634443e1c428dc1.html"))
);
app.get("/sitemap.xml", (req, res) =>
  res.sendFile(path.join(__dirname, "sitemap.xml"))
);
app.get("/ocean", (req, res) =>
  res.sendFile(path.join(__dirname, "public/ocean.html"))
);

// Start Server
// app.listen(PORT, () =>
//   console.log(`Server running at http://localhost:${PORT}`)
// );
// Start server locally, but let Vercel handle it in production
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Export your app configuration for Vercel
module.exports = app;
