const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const Text = require("../models/Text");

// Constant-time password check so response timing can't leak
// how many characters were correct.
function isAdminPasswordCorrect(candidate) {
  const expected = process.env.ADMIN_PASSWORD || "";
  if (!expected || typeof candidate !== "string") return false;

  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  if (a.length !== b.length) {
    // Still run a comparison of equal length so failing fast on
    // length doesn't itself become a timing signal.
    crypto.timingSafeEqual(b, b);
    return false;
  }
  return crypto.timingSafeEqual(a, b);
}

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

// Delete text (requires admin password)
router.delete("/:textId", async (req, res) => {
  try {
    const { password } = req.body || {};

    if (!isAdminPasswordCorrect(password)) {
      return res.status(401).json({ error: "Incorrect admin password." });
    }

    const deleted = await Text.findByIdAndDelete(req.params.textId);
    if (!deleted) {
      return res.status(404).json({ error: "Text not found." });
    }

    res.status(200).json({ message: "Text deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
