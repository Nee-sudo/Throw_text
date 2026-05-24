const express = require("express");
const router = express.Router();
const Message = require("../models/Message");

const MAX_LIMIT = 200;
const DEFAULT_LIMIT = 100;

// Save message
router.post("/", async (req, res) => {
  try {
    const newMessage = new Message(req.body);
    const savedMessage = await newMessage.save();
    res.json(savedMessage);
  } catch (error) {
    res.status(500).json({ error: "Failed to save message" });
  }
});

// Get messages (newest first, lean payload)
router.get("/", async (req, res) => {
  try {
    const limit = Math.min(
      parseInt(req.query.limit, 10) || DEFAULT_LIMIT,
      MAX_LIMIT
    );

    const messages = await Message.find()
      .select("title message country createdAt")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.set("Cache-Control", "private, max-age=15");
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

module.exports = router;
