const express = require("express");
const router = express.Router();
const Text = require("../models/Text");

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 50;

// Save text
router.post("/save", async (req, res) => {
  try {
    const { content, dateTime, serialNumber } = req.body;
    const newText = new Text({ content, dateTime, serialNumber });
    await newText.save();
    res.status(200).send("Text saved successfully.");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

// Get texts (paginated, newest first)
router.get("/all", async (req, res) => {
  try {
    const limit = Math.min(
      parseInt(req.query.limit, 10) || DEFAULT_LIMIT,
      MAX_LIMIT
    );
    const skip = Math.max(parseInt(req.query.skip, 10) || 0, 0);

    const [texts, total] = await Promise.all([
      Text.find()
        .select("content dateTime serialNumber")
        .sort({ serialNumber: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Text.countDocuments(),
    ]);

    res.set("Cache-Control", "no-store, no-cache, must-revalidate");
    res.status(200).json({ texts, total, limit, skip });
  } catch (error) {
    console.error("Error fetching texts:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Get specific text
router.get("/:textId", async (req, res) => {
  try {
    const text = await Text.findById(req.params.textId)
      .select("content dateTime serialNumber")
      .lean();
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
