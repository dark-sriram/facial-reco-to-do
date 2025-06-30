import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

import routes from './routes/routesNotes.js';
import userRoutes from './routes/userRoutes.js';
import { connectDB } from './config/db.js';
import { mockDb } from './config/mockDb.js';
import { db } from './config/dbAdapter.js';
import rateLimiter from './middleware/rateLimiter.js';
import errorHandler from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

// Request logging middleware (should be early)
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// CORS configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? process.env.FRONTEND_URL || false
        : ['http://localhost:5173', 'http://localhost:5001', 'http://127.0.0.1:5173', 'http://127.0.0.1:5001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' })); // Increase limit for face images
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiting
app.use(rateLimiter);

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

// Serve face-api.js models (critical for face recognition)
app.use('/models', express.static(path.join(__dirname, '../../frontend/to_do_app/public/models')));

// Serve static files in production
if (process.env.NODE_ENV === "production") {
    const frontendPath = path.join(__dirname, "../frontend/to_do_app/dist");
    
    // Check if build directory exists
    if (fs.existsSync(frontendPath)) {
        app.use(express.static(frontendPath));
        
        // Handle React Router routes
        app.get("*", (req, res) => {
            const indexPath = path.join(frontendPath, "index.html");
            if (fs.existsSync(indexPath)) {
                res.sendFile(indexPath);
            } else {
                res.status(404).json({ message: "Frontend build not found" });
            }
        });
    } else {
        console.warn('⚠️  Frontend build directory not found');
        app.get("*", (req, res) => {
            res.status(404).json({ 
                message: "Frontend not built. Run 'npm run build' first." 
            });
        });
    }
} else {
    // Development mode - serve models for face recognition
    console.log('📁 Serving face-api.js models from /models');
}

// Global error handling middleware (should be last)
app.use(errorHandler);

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({ message: 'API endpoint not found' });
});

// Global variable to track database status
global.dbConnected = false;
global.usingMockDb = false;

// Start server with graceful database handling
async function startServer() {
    try {
        // Try to connect to MongoDB
        const dbConnection = await connectDB();
        
        if (dbConnection) {
            global.dbConnected = true;
            console.log('✅ Using MongoDB database');
        } else {
            // Fallback to mock database in development
            global.usingMockDb = true;
            console.log('⚠️  Using mock database (development mode)');
            console.log('💡 To use MongoDB, check your connection and restart the server');
        }
    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            global.usingMockDb = true;
            console.log('⚠️  Database connection failed, using mock database');
            console.log('💡 This is normal in development mode');
        } else {
            console.error('❌ Database connection failed in production');
            throw error;
        }
    }
    
    // Start the HTTP server
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
}

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

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT. Shutting down server gracefully...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM. Shutting down server gracefully...');
    process.exit(0);
});

// Handle warnings
process.on('warning', (warning) => {
    console.warn('⚠️  Warning:', warning.name);
    console.warn('Message:', warning.message);
    console.warn('Stack:', warning.stack);
});

// Start the server with comprehensive error handling
startServer().catch((error) => {
    console.error('❌ Failed to start server:', error);
    console.error('Stack:', error.stack);
    
    // In development, try to continue with mock database
    if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Attempting to start with mock database...');
        global.usingMockDb = true;
        
        // Start server without database
        app.listen(PORT, '0.0.0.0', () => {
            console.log('\n🎭 Facial Recognition Todo App (Recovery Mode)');
            console.log('===============================================');
            console.log(`🚀 Server running: http://localhost:${PORT}`);
            console.log(`📝 API endpoints: http://localhost:${PORT}/api`);
            console.log(`🧪 Health check: http://localhost:${PORT}/api/health`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🗄️  Database: Mock DB (Recovery Mode)`);
            console.log('===============================================\n');
            console.log('🎯 Ready for facial recognition authentication!');
            console.log('💡 Open http://localhost:5173 to access the app');
        });
    } else {
        process.exit(1);
    }
});
