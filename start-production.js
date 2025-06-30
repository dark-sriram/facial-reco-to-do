#!/usr/bin/env node

/**
 * Production Startup Script for Facial Recognition Todo App
 * This script handles the complete startup process for production deployment
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
    BACKEND_PORT: process.env.PORT || 5000,
    FRONTEND_BUILD_PATH: path.join(__dirname, 'frontend', 'to_do_app', 'dist'),
    BACKEND_PATH: path.join(__dirname, 'backend'),
    REQUIRED_ENV_VARS: [
        'MONGO_URI',
        'UPSTASH_REDIS_REST_URL',
        'UPSTASH_REDIS_REST_TOKEN'
    ]
};

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkEnvironmentVariables() {
    log('🔍 Checking environment variables...', 'cyan');
    
    const missing = CONFIG.REQUIRED_ENV_VARS.filter(envVar => !process.env[envVar]);
    
    if (missing.length > 0) {
        log('❌ Missing required environment variables:', 'red');
        missing.forEach(envVar => log(`   - ${envVar}`, 'red'));
        log('\n📋 Please set these environment variables before starting the application.', 'yellow');
        log('💡 You can create a .env file in the backend directory.', 'yellow');
        process.exit(1);
    }
    
    log('✅ All required environment variables are set', 'green');
}

function checkBuildExists() {
    log('🏗️  Checking if frontend build exists...', 'cyan');
    
    if (!fs.existsSync(CONFIG.FRONTEND_BUILD_PATH)) {
        log('❌ Frontend build not found. Building now...', 'yellow');
        return buildFrontend();
    }
    
    log('✅ Frontend build found', 'green');
    return Promise.resolve();
}

function buildFrontend() {
    return new Promise((resolve, reject) => {
        log('📦 Building frontend for production...', 'cyan');
        
        const buildProcess = spawn('npm', ['run', 'build'], {
            stdio: 'inherit',
            shell: true
        });
        
        buildProcess.on('close', (code) => {
            if (code === 0) {
                log('✅ Frontend build completed successfully', 'green');
                resolve();
            } else {
                log('❌ Frontend build failed', 'red');
                reject(new Error(`Build process exited with code ${code}`));
            }
        });
        
        buildProcess.on('error', (error) => {
            log(`❌ Build process error: ${error.message}`, 'red');
            reject(error);
        });
    });
}

function startServer() {
    return new Promise((resolve, reject) => {
        log('🚀 Starting production server...', 'cyan');
        
        // Set production environment
        process.env.NODE_ENV = 'production';
        
        const serverProcess = spawn('node', ['src/server.js'], {
            cwd: CONFIG.BACKEND_PATH,
            stdio: 'inherit',
            shell: true
        });
        
        serverProcess.on('close', (code) => {
            if (code === 0) {
                log('✅ Server started successfully', 'green');
                resolve();
            } else {
                log(`❌ Server exited with code ${code}`, 'red');
                reject(new Error(`Server process exited with code ${code}`));
            }
        });
        
        serverProcess.on('error', (error) => {
            log(`❌ Server error: ${error.message}`, 'red');
            reject(error);
        });
        
        // Handle graceful shutdown
        process.on('SIGINT', () => {
            log('\n🛑 Shutting down server...', 'yellow');
            serverProcess.kill('SIGINT');
        });
        
        process.on('SIGTERM', () => {
            log('\n🛑 Shutting down server...', 'yellow');
            serverProcess.kill('SIGTERM');
        });
    });
}

function displayStartupInfo() {
    log('\n🎭 Facial Recognition Todo App', 'magenta');
    log('================================', 'magenta');
    log(`🌐 Server running on: http://localhost:${CONFIG.BACKEND_PORT}`, 'green');
    log(`📱 Application URL: http://localhost:${CONFIG.BACKEND_PORT}`, 'green');
    log(`🔧 Environment: ${process.env.NODE_ENV || 'production'}`, 'blue');
    log(`📊 Health Check: http://localhost:${CONFIG.BACKEND_PORT}/api/health`, 'blue');
    log('\n📝 Features:', 'cyan');
    log('   • Facial Recognition Authentication', 'cyan');
    log('   • Personal Task Management', 'cyan');
    log('   • Real-time Face Detection', 'cyan');
    log('   • Secure Data Storage', 'cyan');
    log('\n🔒 Security Features Enabled:', 'green');
    log('   • Rate Limiting', 'green');
    log('   • CORS Protection', 'green');
    log('   • Input Validation', 'green');
    log('   • Environment Variable Protection', 'green');
    log('\n💡 Tips:', 'yellow');
    log('   • Ensure good lighting for face recognition', 'yellow');
    log('   • Allow camera permissions when prompted', 'yellow');
    log('   • Use HTTPS in production for camera access', 'yellow');
    log('\n🆘 Support: https://github.com/dark-sriram/facial-reco-to-do', 'blue');
    log('================================\n', 'magenta');
}

async function main() {
    try {
        log('🎭 Starting Facial Recognition Todo App...', 'bright');
        log('==========================================\n', 'bright');
        
        // Pre-flight checks
        checkEnvironmentVariables();
        await checkBuildExists();
        
        // Display startup information
        displayStartupInfo();
        
        // Start the server
        await startServer();
        
    } catch (error) {
        log(`❌ Startup failed: ${error.message}`, 'red');
        log('\n🔧 Troubleshooting:', 'yellow');
        log('   1. Check if all environment variables are set', 'yellow');
        log('   2. Ensure MongoDB is accessible', 'yellow');
        log('   3. Verify Redis connection (if using)', 'yellow');
        log('   4. Check if port is available', 'yellow');
        log('   5. Review the error logs above', 'yellow');
        process.exit(1);
    }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    log(`❌ Unhandled Rejection at: ${promise}, reason: ${reason}`, 'red');
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    log(`❌ Uncaught Exception: ${error.message}`, 'red');
    process.exit(1);
});

// Start the application
if (require.main === module) {
    main();
}

module.exports = { main, CONFIG };