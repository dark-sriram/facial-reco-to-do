#!/usr/bin/env node

/**
 * Safe Server Startup Script
 * Handles all potential startup issues and provides fallbacks
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkEnvironment() {
    log('🔍 Checking environment...', 'cyan');
    
    // Check if .env file exists
    if (!fs.existsSync('.env')) {
        log('⚠️  .env file not found, creating default...', 'yellow');
        const defaultEnv = `# Backend Environment Variables
NODE_ENV=development
PORT=5000

# MongoDB Configuration (optional)
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/facial_recognition_todo

# Redis Configuration (optional)
# UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
# UPSTASH_REDIS_REST_TOKEN=your-redis-token

# Frontend URL
FRONTEND_URL=http://localhost:5173
`;
        fs.writeFileSync('.env', defaultEnv);
        log('✅ Default .env file created', 'green');
    }
    
    // Check if node_modules exists
    if (!fs.existsSync('node_modules')) {
        log('❌ node_modules not found. Please run: npm install', 'red');
        process.exit(1);
    }
    
    log('✅ Environment check passed', 'green');
}

function startServer() {
    return new Promise((resolve, reject) => {
        log('🚀 Starting backend server...', 'cyan');
        
        const serverProcess = spawn('node', ['src/server.js'], {
            stdio: 'inherit',
            env: { ...process.env, NODE_ENV: 'development' }
        });

        serverProcess.on('error', (error) => {
            log(`❌ Failed to start server: ${error.message}`, 'red');
            reject(error);
        });

        serverProcess.on('exit', (code, signal) => {
            if (code === 0) {
                log('✅ Server stopped gracefully', 'green');
            } else {
                log(`❌ Server exited with code ${code} and signal ${signal}`, 'red');
            }
            resolve(code);
        });

        // Handle process termination
        process.on('SIGINT', () => {
            log('\n🛑 Shutting down...', 'yellow');
            serverProcess.kill('SIGINT');
        });

        process.on('SIGTERM', () => {
            log('\n🛑 Shutting down...', 'yellow');
            serverProcess.kill('SIGTERM');
        });
    });
}

async function main() {
    try {
        log('🎭 Facial Recognition Todo - Backend Server', 'bright');
        log('==========================================', 'bright');
        
        checkEnvironment();
        await startServer();
        
    } catch (error) {
        log(`❌ Startup failed: ${error.message}`, 'red');
        log('\n🔧 Troubleshooting:', 'yellow');
        log('   1. Run: npm install', 'yellow');
        log('   2. Check Node.js version (18+ required)', 'yellow');
        log('   3. Ensure port 5000 is available', 'yellow');
        log('   4. Check .env configuration', 'yellow');
        process.exit(1);
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}