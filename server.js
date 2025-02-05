const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config(); // Load environment variables from .env file
const app = express();
const PORT = 3000;
const requestIp = require('request-ip');

const URI = process.env.MONGO_URI || 'mongodb+srv://neer:bjFBXFCYd00Gifiv@my-journal-app.ges8oic.mongodb.net/?retryWrites=true&w=majority'; // MongoDB URI  
// Connect to MongoDB (replace 'your_database_url' with your actual MongoDB URL)
mongoose.connect(URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Define a schema for your data
const textSchema = new mongoose.Schema({
  content: String
});

// Create a model based on the schema
const Text = mongoose.model('Text', textSchema);

app.use(bodyParser.json());
app.use(requestIp.mw()); // Middleware to get IP address
// Serve the HTML file
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to save text
app.post('/api/saveText', async (req, res) => {
  const content = req.body.content;

  try {
    // Create a new Text document and save it to the database
    const newText = new Text({ content });
    await newText.save();
    res.status(200).send('Text saved successfully.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// API endpoint to get all texts
app.get('/api/getAllTexts', async (req, res) => {
  try {
    // Retrieve all Text documents from the database
    const allTexts = await Text.find();
    res.json(allTexts);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.delete('/api/deleteText/:textId', async (req, res) => {
  const { textId } = req.params;

  try {
    // Delete the text with the specified textId from the database
    await Text.findByIdAndDelete(textId);
    res.status(200).send('Text deleted successfully.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
// API endpoint to get a specific text by ID
app.get('/api/getText/:textId', async (req, res) => {
  const { textId } = req.params;
  console.log('Fetching text with ID:', textId);

  try {
    if (!mongoose.Types.ObjectId.isValid(textId)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const text = await Text.findById(textId);
    if (!text) {
      return res.status(404).json({ error: 'Text not found' });
    }

    res.json(text);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Visitor Schema
const visitorSchema = new mongoose.Schema({
  ip: String,
  visits: { type: Number, default: 1 },
  lastVisit: { type: Date, default: Date.now }
});

const Visitor = mongoose.model('Visitor', visitorSchema);

// Track Visitor
app.get('/api/track-visitor', async (req, res) => {
  try {
    const ip = req.clientIp || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    console.log('Visitor IP:', ip);

    let visitor = await Visitor.findOne({ ip });

    if (visitor) {
      visitor.visits += 1;
      visitor.lastVisit = new Date();
      await visitor.save();
    } else {
      visitor = new Visitor({ ip });
      await visitor.save();
    }

    res.json({ message: 'Visitor tracked', visits: visitor.visits });
  } catch (error) {
    console.error('Error tracking visitor:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get Visitor Stats
app.get('/api/visitor-stats', async (req, res) => {
  try {
    const uniqueVisitors = await Visitor.countDocuments();
    const frequentVisitors = await Visitor.find().sort({ visits: -1 }).limit(5); // Top 5 frequent visitors

    res.json({ uniqueVisitors, frequentVisitors });
  } catch (error) {
    console.error('Error fetching visitor stats:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
//google route 
app.get('/google3634443e1c428dc1.html', (req, res) => {
  const filePath = path.join(__dirname, 'google3634443e1c428dc1.html'); // Path to a local PDF
  res.setHeader('Content-Disposition', 'inline');
  res.sendFile(filePath);
});
//sitemap
app.get('/sitemap.xml', (req, res) => {
  const filePath = path.join(__dirname, 'sitemap.xml'); 
  res.sendFile(filePath);
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
