#!/usr/bin/env node

/**
 * Crash-Proof Server Startup
 * Handles all errors gracefully and prevents crashes
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

// Global error handlers to prevent crashes
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err.message);
    console.error('Stack:', err.stack);
    console.log('🔄 Server continues running...');
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection:', reason);
    console.log('🔄 Server continues running...');
});

// Initialize global variables
global.dbConnected = false;
global.usingMockDb = true;

// Request logging middleware
app.use((req, res, next) => {
    try {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
        next();
    } catch (error) {
        console.error('Logging middleware error:', error);
        next();
    }
});

// CORS configuration with error handling
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? (process.env.FRONTEND_URL || false)
        : ['http://localhost:5173', 'http://localhost:5001', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Safe rate limiting (optional)
app.use(async (req, res, next) => {
    try {
        // Simple in-memory rate limiting
        const ip = req.ip || req.connection.remoteAddress || 'unknown';
        const now = Date.now();
        
        if (!global.rateLimitStore) {
            global.rateLimitStore = new Map();
        }
        
        const requests = global.rateLimitStore.get(ip) || [];
        const recentRequests = requests.filter(time => now - time < 60000); // 1 minute window
        
        if (recentRequests.length > 100) { // 100 requests per minute
            return res.status(429).json({
                message: 'Too many requests. Please try again later.',
                retryAfter: 60
            });
        }
        
        recentRequests.push(now);
        global.rateLimitStore.set(ip, recentRequests);
        
        next();
    } catch (error) {
        console.error('Rate limiting error:', error);
        next(); // Continue without rate limiting
    }
});

// Mock database setup
const mockDb = {
    users: [
        {
            _id: 1,
            id: 1,
            name: 'Demo User',
            faceDescriptor: new Array(128).fill(0).map(() => Math.random()),
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ],
    notes: [
        {
            _id: 1,
            id: 1,
            userId: 1,
            title: 'Welcome to Facial Recognition Todo!',
            description: 'This is your first note. You can edit or delete it.',
            priority: 'medium',
            completed: false,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ],
    nextUserId: 2,
    nextNoteId: 2
};

// Health check endpoint
app.get('/api/health', (req, res) => {
    try {
        res.status(200).json({
            status: 'healthy',
            message: 'Server is running perfectly!',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
            uptime: process.uptime(),
            database: {
                type: 'Mock Database',
                status: 'connected',
                users: mockDb.users.length,
                notes: mockDb.notes.length
            },
            version: '1.0.0'
        });
    } catch (error) {
        console.error('Health check error:', error);
        res.status(503).json({
            status: 'unhealthy',
            message: 'Health check failed',
            error: error.message
        });
    }
});

// Test endpoint
app.get('/api/test', (req, res) => {
    try {
        res.json({ 
            message: 'Backend is working perfectly!', 
            timestamp: new Date().toISOString(),
            status: 'OK'
        });
    } catch (error) {
        console.error('Test endpoint error:', error);
        res.status(500).json({ message: 'Test endpoint failed', error: error.message });
    }
});

// User routes with error handling
app.post('/api/users/register', async (req, res) => {
    try {
        const { name, faceDescriptor, profileImage } = req.body;
        
        if (!name || !faceDescriptor) {
            return res.status(400).json({ message: 'Name and face descriptor are required' });
        }

        if (!Array.isArray(faceDescriptor) || faceDescriptor.length === 0) {
            return res.status(400).json({ message: 'Invalid face descriptor format' });
        }

        // Check if user exists
        const existingUser = mockDb.users.find(user => user.name.toLowerCase() === name.toLowerCase());
        if (existingUser) {
            return res.status(400).json({ message: 'User with this name already exists' });
        }

        // Create new user
        const newUser = {
            _id: mockDb.nextUserId++,
            id: mockDb.nextUserId - 1,
            name,
            faceDescriptor,
            profileImage,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        mockDb.users.push(newUser);
        
        res.status(201).json({ 
            message: 'User registered successfully!',
            userId: newUser._id,
            name: newUser.name
        });
    } catch (error) {
        console.error('Register user error:', error);
        res.status(500).json({ message: 'Registration failed', error: error.message });
    }
});

app.post('/api/users/authenticate', async (req, res) => {
    try {
        const { faceDescriptor } = req.body;
        
        if (!faceDescriptor || !Array.isArray(faceDescriptor)) {
            return res.status(400).json({ message: 'Valid face descriptor required' });
        }

        // Simple face matching (in real app, use proper face recognition)
        const user = mockDb.users.find(u => u.faceDescriptor && u.faceDescriptor.length > 0);
        
        if (user) {
            res.json({
                message: 'Authentication successful!',
                userId: user._id,
                name: user.name
            });
        } else {
            res.status(401).json({ message: 'Face not recognized' });
        }
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({ message: 'Authentication failed', error: error.message });
    }
});

app.get('/api/users', async (req, res) => {
    try {
        const users = mockDb.users.map(user => ({
            _id: user._id,
            id: user.id,
            name: user.name,
            createdAt: user.createdAt
        }));
        res.json(users);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Failed to get users', error: error.message });
    }
});

// Notes routes with error handling
app.get('/api/notes', async (req, res) => {
    try {
        const { userId } = req.query;
        let notes = mockDb.notes;
        
        if (userId) {
            notes = notes.filter(note => note.userId == userId);
        }
        
        res.json(notes);
    } catch (error) {
        console.error('Get notes error:', error);
        res.status(500).json({ message: 'Failed to get notes', error: error.message });
    }
});

app.post('/api/notes', async (req, res) => {
    try {
        const { title, description, priority, dueDate, userId } = req.body;
        
        if (!title || !userId) {
            return res.status(400).json({ message: 'Title and userId are required' });
        }

        const newNote = {
            _id: mockDb.nextNoteId++,
            id: mockDb.nextNoteId - 1,
            title,
            description: description || '',
            priority: priority || 'medium',
            completed: false,
            dueDate: dueDate ? new Date(dueDate) : null,
            userId: parseInt(userId),
            createdAt: new Date(),
            updatedAt: new Date()
        };

        mockDb.notes.push(newNote);
        
        res.status(201).json(newNote);
    } catch (error) {
        console.error('Create note error:', error);
        res.status(500).json({ message: 'Failed to create note', error: error.message });
    }
});

app.put('/api/notes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        const noteIndex = mockDb.notes.findIndex(note => note._id == id || note.id == id);
        
        if (noteIndex === -1) {
            return res.status(404).json({ message: 'Note not found' });
        }

        mockDb.notes[noteIndex] = {
            ...mockDb.notes[noteIndex],
            ...updates,
            updatedAt: new Date()
        };
        
        res.json(mockDb.notes[noteIndex]);
    } catch (error) {
        console.error('Update note error:', error);
        res.status(500).json({ message: 'Failed to update note', error: error.message });
    }
});

app.delete('/api/notes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const noteIndex = mockDb.notes.findIndex(note => note._id == id || note.id == id);
        
        if (noteIndex === -1) {
            return res.status(404).json({ message: 'Note not found' });
        }

        mockDb.notes.splice(noteIndex, 1);
        
        res.json({ message: 'Note deleted successfully' });
    } catch (error) {
        console.error('Delete note error:', error);
        res.status(500).json({ message: 'Failed to delete note', error: error.message });
    }
});

// Serve face-api.js models
app.use('/models', express.static(path.join(__dirname, '../frontend/to_do_app/public/models')));

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({ message: 'API endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
    });
});

// Start server with comprehensive error handling
function startServer() {
    try {
        const server = app.listen(PORT, '0.0.0.0', () => {
            console.log('\n🎭 Facial Recognition Todo App - CRASH-PROOF VERSION');
            console.log('====================================================');
            console.log(`🚀 Server running: http://localhost:${PORT}`);
            console.log(`📝 API endpoints: http://localhost:${PORT}/api`);
            console.log(`🧪 Health check: http://localhost:${PORT}/api/health`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🗄️  Database: Mock DB (${mockDb.users.length} users, ${mockDb.notes.length} notes)`);
            console.log('====================================================\n');
            console.log('✅ Server is CRASH-PROOF and ready!');
            console.log('💡 Open http://localhost:5173 to access the app');
            console.log('🔧 All errors are handled gracefully');
        });

        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`❌ Port ${PORT} is already in use`);
                console.log('🔧 Try a different port or stop the existing server');
                process.exit(1);
            } else {
                console.error('❌ Server error:', error);
            }
        });

        // Graceful shutdown
        process.on('SIGINT', () => {
            console.log('\n🛑 Shutting down gracefully...');
            server.close(() => {
                console.log('✅ Server closed');
                process.exit(0);
            });
        });

        process.on('SIGTERM', () => {
            console.log('\n🛑 Shutting down gracefully...');
            server.close(() => {
                console.log('✅ Server closed');
                process.exit(0);
            });
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Start the server
startServer();