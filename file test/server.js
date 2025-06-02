const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config();

const app = express();
const upload = multer(); // handles multipart/form-data
const PORT = 3000;

app.use(cors());

// Add this above your routes
app.use(express.static(path.join(__dirname, 'public')));

// Fallback for any unhandled GET requests (like '/')
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

let db;

// Connect to MongoDB
const client = new MongoClient('mongodb://localhost:27017');
client.connect().then(() => {
  db = client.db('mydb');
  console.log('Connected to MongoDB');
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}).catch(console.error);

// Handle file upload
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;

    if (!file) return res.status(400).send('No file uploaded');

    const doc = {
      filename: file.originalname,
      contentType: file.mimetype,
      size: file.size,
      data: file.buffer, // <== Buffer stored in MongoDB
    };

    await db.collection('file-test').insertOne(doc);
    res.status(200).json({ message: 'File uploaded successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Upload failed' });
  }
});
