const express = require("express");
const mongoose = require("mongoose");
const app = express();
const port = 5000;

// MongoDB connection
mongoose
  .connect(
    "mongodb+srv://neer:bjFBXFCYd00Gifiv@pdf-uploading-site.ges8oic.mongodb.net/?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Define message schema
const messageSchema = new mongoose.Schema({
  title: String,
  message: String,
  ipAddress: String,
  country: String,
  region: String,
  city: String,
  createdAt: { type: Date, default: Date.now },
});

const Message = mongoose.model("Usermessage", messageSchema); // Model name is "Usermessage"

app.use(express.json());
app.use(express.static("public"));

app.get("/ocean", (req, res) => {
  res.sendFile(__dirname + "/public/ocean.html");
});

app.get("/ocean.css", (req, res) => {
  res.sendFile(__dirname + "/public/ocean.css");
});

app.get("/ocean.js", (req, res) => {
  res.sendFile(__dirname + "/public/ocean.js");
});

// API endpoint to save messages
app.post("/api/messages", (req, res) => {
  const { title, message, ipAddress } = req.body;
  const newMessage = new Message({ // Use the correct model name: Message
    title,
    message,
    ipAddress,
    country: req.body.country,
    region: req.body.region,
    city: req.body.city,
  });

  newMessage
    .save()
    .then((savedMessage) => res.json(savedMessage))
    .catch((err) => res.status(500).json({ error: "Failed to save message" }));
});

// API endpoint to get all messages
app.get("/api/messages", (req, res) => {
  Message.find() // Use the correct model name: Message
    .then((messages) => res.json(messages))
    .catch((err) =>
      res.status(500).json({ error: "Failed to fetch messages" })
    );
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});