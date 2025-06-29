import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import routes from './routes/routesNotes.js';
import userRoutes from './routes/userRoutes.js';
import { connectDB } from './config/db.js';
import rateLimiter from '../src/middleware/rateLimiter.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
    cors({
        origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    })
);
app.use(express.json());
app.use(rateLimiter);

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'Backend is working!', 
        timestamp: new Date().toISOString(),
        status: 'OK'
    });
});

app.use('/api/notes', routes);
app.use('/api/users', userRoutes);

// Add request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Add error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
});

connectDB().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Server is running on http://localhost:${PORT}`);
        console.log(`📝 API endpoints available at http://localhost:${PORT}/api`);
        console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
    });
}).catch((error) => {
    console.error('Failed to start server:', error);
});

//pass GY7Zt60qxpHxAteA

//mongodb+srv://sri812469:GY7Zt60qxpHxAteA@cluster0.sv1bszo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
