const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();
const requestIp = require("request-ip");

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
app.use(express.static(path.join(__dirname, "public")));

// Connect to DB
const connectDB = require("./config/db");
connectDB();

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
app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
