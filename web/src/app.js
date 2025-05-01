const express = require('express');
const path = require('path');
const cors = require('cors');

const dataRoutes = require('./routes/dataRoutes');
const geminiRoutes = require('./routes/geminiRoutes');

const app = express();

app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:5000'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api/data', dataRoutes);
app.use('/api/gemini', geminiRoutes);

// Server the main HTML file
app.get('/', (request, response) => response.sendFile(path.join(__dirname, '../public/index.html')));

app.get('/favicon.ico', (request, response) => {
    response.status(204).end();
});

module.exports = app;