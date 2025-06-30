#!/usr/bin/env node

/**
 * Quick Deployment Script for Facial Recognition Todo App
 * Handles complete setup and deployment in one command
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

// Configuration
const CONFIG = {
    BACKEND_PORT: process.env.PORT || 5000,
    FRONTEND_PORT: 5173,
    TIMEOUT: 30000,
    MAX_RETRIES: 3
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

function runCommand(command, options = {}) {
    return new Promise((resolve, reject) => {
        const child = spawn(command, options.args || [], {
            shell: true,
            stdio: options.silent ? 'pipe' : 'inherit',
            cwd: options.cwd || process.cwd(),
            ...options
        });

        let output = '';
        if (options.silent) {
            child.stdout.on('data', (data) => {
                output += data.toString();
            });
            child.stderr.on('data', (data) => {
                output += data.toString();
            });
        }

        child.on('close', (code) => {
            if (code === 0) {
                resolve(output);
            } else {
                reject(new Error(`Command failed with code ${code}: ${output}`));
            }
        });

        child.on('error', (error) => {
            reject(error);
        });
    });
}

function checkPort(port) {
    return new Promise((resolve) => {
        const req = http.request({
            hostname: 'localhost',
            port: port,
            path: '/',
            timeout: 2000
        }, (res) => {
            resolve(true);
        });

        req.on('error', () => {
            resolve(false);
        });

        req.on('timeout', () => {
            resolve(false);
        });

        req.end();
    });
}

async function installDependencies() {
    log('📦 Installing dependencies...', 'cyan');
    
    try {
        log('   Installing root dependencies...', 'blue');
        await runCommand('npm install', { silent: true });
        
        log('   Installing backend dependencies...', 'blue');
        await runCommand('npm install', { cwd: 'backend', silent: true });
        
        log('   Installing frontend dependencies...', 'blue');
        await runCommand('npm install', { cwd: 'frontend/to_do_app', silent: true });
        
        log('✅ Dependencies installed successfully', 'green');
    } catch (error) {
        log(`❌ Failed to install dependencies: ${error.message}`, 'red');
        throw error;
    }
}

async function buildFrontend() {
    log('🏗️  Building frontend...', 'cyan');
    
    try {
        await runCommand('npm run build', { cwd: 'frontend/to_do_app', silent: true });
        log('✅ Frontend built successfully', 'green');
    } catch (error) {
        log(`❌ Frontend build failed: ${error.message}`, 'red');
        throw error;
    }
}

async function startBackend() {
    log('🚀 Starting backend server...', 'cyan');
    
    return new Promise((resolve, reject) => {
        const backend = spawn('npm', ['run', 'dev'], {
            cwd: 'backend',
            stdio: 'pipe',
            shell: true
        });

        let output = '';
        backend.stdout.on('data', (data) => {
            output += data.toString();
            if (output.includes('Ready for facial recognition authentication!')) {
                log('✅ Backend server started successfully', 'green');
                resolve(backend);
            }
        });

        backend.stderr.on('data', (data) => {
            output += data.toString();
        });

        backend.on('error', (error) => {
            reject(error);
        });

        // Timeout after 30 seconds
        setTimeout(() => {
            if (!output.includes('Ready for facial recognition authentication!')) {
                reject(new Error('Backend startup timeout'));
            }
        }, CONFIG.TIMEOUT);
    });
}

async function startFrontend() {
    log('🎨 Starting frontend development server...', 'cyan');
    
    return new Promise((resolve, reject) => {
        const frontend = spawn('npm', ['run', 'dev'], {
            cwd: 'frontend/to_do_app',
            stdio: 'pipe',
            shell: true
        });

        let output = '';
        frontend.stdout.on('data', (data) => {
            output += data.toString();
            if (output.includes('Local:') && output.includes('5173')) {
                log('✅ Frontend server started successfully', 'green');
                resolve(frontend);
            }
        });

        frontend.stderr.on('data', (data) => {
            output += data.toString();
        });

        frontend.on('error', (error) => {
            reject(error);
        });

        // Timeout after 30 seconds
        setTimeout(() => {
            if (!output.includes('Local:')) {
                reject(new Error('Frontend startup timeout'));
            }
        }, CONFIG.TIMEOUT);
    });
}

async function waitForServices() {
    log('⏳ Waiting for services to be ready...', 'cyan');
    
    let backendReady = false;
    let frontendReady = false;
    let retries = 0;
    
    while ((!backendReady || !frontendReady) && retries < CONFIG.MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        if (!backendReady) {
            backendReady = await checkPort(CONFIG.BACKEND_PORT);
            if (backendReady) {
                log('✅ Backend service is ready', 'green');
            }
        }
        
        if (!frontendReady) {
            frontendReady = await checkPort(CONFIG.FRONTEND_PORT);
            if (frontendReady) {
                log('✅ Frontend service is ready', 'green');
            }
        }
        
        retries++;
    }
    
    if (!backendReady || !frontendReady) {
        throw new Error('Services failed to start within timeout period');
    }
}

async function runHealthCheck() {
    log('🏥 Running health check...', 'cyan');
    
    try {
        const healthCheck = await runCommand('node test-app.js', { silent: true });
        log('✅ Health check passed', 'green');
        return true;
    } catch (error) {
        log('⚠️  Health check had some issues, but services are running', 'yellow');
        return false;
    }
}

function displaySuccessMessage() {
    log('\n🎉 Deployment Successful!', 'bright');
    log('========================', 'bright');
    log('🎭 Facial Recognition Todo App is now running!', 'magenta');
    log('', 'reset');
    log('📱 Frontend: http://localhost:5173', 'green');
    log('🔧 Backend API: http://localhost:5000/api', 'green');
    log('🏥 Health Check: http://localhost:5000/api/health', 'blue');
    log('', 'reset');
    log('🚀 Features Available:', 'cyan');
    log('   • Facial Recognition Authentication', 'cyan');
    log('   • Personal Task Management', 'cyan');
    log('   • Real-time Face Detection', 'cyan');
    log('   • Secure Data Storage (Mock DB in dev)', 'cyan');
    log('', 'reset');
    log('💡 Usage Tips:', 'yellow');
    log('   • Ensure good lighting for face recognition', 'yellow');
    log('   • Allow camera permissions when prompted', 'yellow');
    log('   • Register your face first before logging in', 'yellow');
    log('   • Use Chrome/Firefox for best compatibility', 'yellow');
    log('', 'reset');
    log('🛑 To stop the application:', 'red');
    log('   Press Ctrl+C in this terminal', 'red');
    log('', 'reset');
    log('📚 Documentation:', 'blue');
    log('   • README.md - Setup instructions', 'blue');
    log('   • DEPLOYMENT_GUIDE.md - Production deployment', 'blue');
    log('   • FIXES_AND_IMPROVEMENTS.md - What was fixed', 'blue');
    log('========================\n', 'bright');
}

async function main() {
    try {
        log('🎭 Facial Recognition Todo App - Quick Deploy', 'bright');
        log('==============================================\n', 'bright');
        
        // Check if we're in the right directory
        if (!fs.existsSync('package.json')) {
            throw new Error('Please run this script from the project root directory');
        }
        
        // Install dependencies
        await installDependencies();
        
        // Build frontend
        await buildFrontend();
        
        // Start services
        const backendProcess = await startBackend();
        const frontendProcess = await startFrontend();
        
        // Wait for services to be ready
        await waitForServices();
        
        // Run health check
        await runHealthCheck();
        
        // Display success message
        displaySuccessMessage();
        
        // Handle graceful shutdown
        process.on('SIGINT', () => {
            log('\n🛑 Shutting down services...', 'yellow');
            backendProcess.kill('SIGINT');
            frontendProcess.kill('SIGINT');
            process.exit(0);
        });
        
        process.on('SIGTERM', () => {
            log('\n🛑 Shutting down services...', 'yellow');
            backendProcess.kill('SIGTERM');
            frontendProcess.kill('SIGTERM');
            process.exit(0);
        });
        
        // Keep the process alive
        await new Promise(() => {}); // Run indefinitely
        
    } catch (error) {
        log(`❌ Deployment failed: ${error.message}`, 'red');
        log('\n🔧 Troubleshooting:', 'yellow');
        log('   1. Check if Node.js v18+ is installed', 'yellow');
        log('   2. Ensure ports 5000 and 5173 are available', 'yellow');
        log('   3. Check internet connection for dependencies', 'yellow');
        log('   4. Try running: npm run install-all', 'yellow');
        log('   5. Check the error message above for specific issues', 'yellow');
        process.exit(1);
    }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    log(`❌ Unhandled Rejection: ${reason}`, 'red');
    process.exit(1);
});

// Start deployment if this script is run directly
if (require.main === module) {
    main();
}

module.exports = { main, CONFIG };