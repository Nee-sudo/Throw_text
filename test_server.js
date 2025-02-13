const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 5000; // Choose your port

// MongoDB connection
mongoose.connect('mongodb+srv://neer:bjFBXFCYd00Gifiv@pdf-uploading-site.ges8oic.mongodb.net/?retryWrites=true&w=majority', { // Replace with your MongoDB URI
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Define message schema
const messageSchema = new mongoose.Schema({
    title: String,
    message: String,
    ipAddress: String
});

const Message = mongoose.model('Message', messageSchema);

app.use(express.json()); // Enable parsing JSON request bodies
app.use(express.static('public')); // Serve static files from the 'public' directory
app.get('/test', (req, res) => {
    res.sendFile(__dirname + '/public/test.html');
});
app.get('/test.css', (req, res) => {
    res.sendFile(__dirname + '/public/test.css');
});
app.get('/test.js', (req, res) => {
    res.sendFile(__dirname + '/public/test.js');
});


// API endpoint to save messages
app.post('/api/messages', (req, res) => {
    const { title, message, ipAddress } = req.body;
    const newMessage = new Message({ title, message, ipAddress });

    newMessage.save()
        .then(savedMessage => res.json(savedMessage))
        .catch(err => res.status(500).json({ error: 'Failed to save message' }));
});

// API endpoint to get all messages
app.get('/api/messages', (req, res) => {
    Message.find()
        .then(messages => res.json(messages))
        .catch(err => res.status(500).json({ error: 'Failed to fetch messages' }));
});


app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});