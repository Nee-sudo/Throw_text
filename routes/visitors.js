const express = require("express");
const router = express.Router();
const Visitor = require("../models/Visitor");

// Track visitor
router.get("/track", async (req, res) => {
  try {
    const ip =
      req.clientIp ||
      req.headers["x-forwarded-for"] ||
      req.socket.remoteAddress;
    let visitor = await Visitor.findOne({ ip });

    if (visitor) {
      visitor.visits += 1;
      visitor.lastVisit = new Date();
      await visitor.save();
    } else {
      visitor = new Visitor({ ip });
      await visitor.save();
    }

    res.json({ message: "Visitor tracked", visits: visitor.visits });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get visitor stats
router.get("/stats", async (req, res) => {
  try {
    const uniqueVisitors = await Visitor.countDocuments();
    res.set("Cache-Control", "private, max-age=60");
    res.json({ uniqueVisitors });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Track Visitor
router.get("/track-visitor", async (req, res) => {
  try {
    const ip =
      req.clientIp ||
      req.headers["x-forwarded-for"] ||
      req.socket.remoteAddress;
    console.log("Visitor IP:", ip);

    let visitor = await Visitor.findOne({ ip });

    if (visitor) {
      visitor.visits += 1;
      visitor.lastVisit = new Date();
      await visitor.save();
    } else {
      visitor = new Visitor({ ip });
      await visitor.save();
    }

    res.json({ message: "Visitor tracked", visits: visitor.visits });
  } catch (error) {
    console.error("Error tracking visitor:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
