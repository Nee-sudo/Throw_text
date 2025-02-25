const express = require("express");
const router = express.Router();
const Text = require("../models/Text");

// Save text
router.post("/save", async (req, res) => {
  try {
    const newText = new Text({ content: req.body.content });
    await newText.save();
    res.status(200).send("Text saved successfully.");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

// Get all texts
router.get("/all", async (req, res) => {
  try {
    const texts = await Text.find();
    res.json(texts);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

// Get specific text
router.get("/:textId", async (req, res) => {
  try {
    const text = await Text.findById(req.params.textId);
    if (!text) return res.status(404).json({ error: "Text not found" });
    res.json(text);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete text
router.delete("/:textId", async (req, res) => {
  try {
    await Text.findByIdAndDelete(req.params.textId);
    res.status(200).send("Text deleted successfully.");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
