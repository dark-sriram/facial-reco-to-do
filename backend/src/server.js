import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import routes from './routes/routesNotes.js';
import userRoutes from './routes/userRoutes.js';
import { connectDB } from './config/db.js';
import { mockDb } from './config/mockDb.js';
import { db } from './config/dbAdapter.js';
import rateLimiter from './middleware/rateLimiter.js';
import errorHandler from './middleware/errorHandler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

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

// Add request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        const dbHealth = await db.healthCheck();
        
        res.status(200).json({
            status: 'healthy',
            message: 'Server is healthy!',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
            uptime: process.uptime(),
            database: dbHealth,
            version: '1.0.0'
        });
    } catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            message: 'Server health check failed',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
            uptime: process.uptime(),
            error: error.message,
            version: '1.0.0'
        });
    }
});

// Legacy test endpoint for backward compatibility
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'Backend is working!', 
        timestamp: new Date().toISOString(),
        status: 'OK'
    });
});

// API routes
app.use('/api/notes', routes);
app.use('/api/users', userRoutes);

// Serve static files from the React app build directory in production
if (process.env.NODE_ENV === 'production') {
    const frontendDistPath = path.join(__dirname, '../../frontend/to_do_app/dist');
    console.log(`🗂️  Serving static files from: ${frontendDistPath}`);
    console.log(`📁 Directory exists: ${fs.existsSync(frontendDistPath)}`);
    
    app.use(express.static(frontendDistPath));
    
    // Handle React routing, return all requests to React app
    app.get('*', (req, res) => {
        res.sendFile(path.join(frontendDistPath, 'index.html'));
    });
}

// Add error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
});

connectDB().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
        console.log('\n🎭 Facial Recognition Todo App');
        console.log('================================');
        console.log(`🚀 Server running: http://localhost:${PORT}`);
        console.log(`📝 API endpoints: http://localhost:${PORT}/api`);
        console.log(`🧪 Health check: http://localhost:${PORT}/api/health`);
        console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🗄️  Database: ${global.dbConnected ? 'MongoDB' : 'Mock DB'}`);
        
        if (global.usingMockDb) {
            const stats = mockDb.getStats();
            console.log(`📊 Mock DB Stats: ${stats.users} users, ${stats.notes} notes`);
        }
        
        console.log('================================\n');
        console.log('🎯 Ready for facial recognition authentication!');
        console.log('💡 Open http://localhost:5173 to access the app');
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    console.error('Stack:', err.stack);
    console.log('🔄 Server will continue running...');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise);
    console.error('Reason:', reason);
    console.log('🔄 Server will continue running...');
});


