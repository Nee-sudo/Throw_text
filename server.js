const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// Connect to MongoDB (replace 'your_database_url' with your actual MongoDB URL)
mongoose.connect('mongodb+srv://neer:bjFBXFCYd00Gifiv@pdf-uploading-site.ges8oic.mongodb.net/?retryWrites=true&w=majority', {
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


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
