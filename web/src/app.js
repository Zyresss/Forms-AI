import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cors from 'cors';
import dataRoutes from './routes/dataRoutes.js';
import geminiRoutes from './routes/geminiRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

export default app;