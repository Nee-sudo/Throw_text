const express = require("express");
const router = express.Router();
const Message = require("../models/Message");

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

// Get all messages
router.get("/", async (req, res) => {
  try {
    const messages = await Message.find();
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

module.exports = router;
