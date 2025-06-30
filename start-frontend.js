#!/usr/bin/env node

/**
 * Frontend Startup Script
 * Starts the frontend development server
 */

const { spawn } = require('child_process');
const path = require('path');

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

function startFrontend() {
    log('\n🎨 Starting Frontend Development Server', 'bright');
    log('======================================', 'bright');
    log('🚀 Starting Vite development server...', 'cyan');
    
    const frontend = spawn('npm', ['run', 'dev'], {
        cwd: path.join('frontend', 'to_do_app'),
        stdio: 'inherit',
        shell: true
    });

    frontend.on('error', (error) => {
        log(`❌ Frontend error: ${error.message}`, 'red');
        log('\n🔧 Troubleshooting:', 'yellow');
        log('   1. Make sure you\'re in the project root directory', 'yellow');
        log('   2. Run: cd frontend/to_do_app && npm install', 'yellow');
        log('   3. Check if Node.js and npm are installed', 'yellow');
        process.exit(1);
    });

    frontend.on('exit', (code) => {
        if (code !== 0) {
            log(`❌ Frontend exited with code ${code}`, 'red');
        } else {
            log('✅ Frontend stopped gracefully', 'green');
        }
        process.exit(code);
    });

    // Handle graceful shutdown
    process.on('SIGINT', () => {
        log('\n🛑 Shutting down frontend...', 'yellow');
        frontend.kill('SIGINT');
    });

    process.on('SIGTERM', () => {
        log('\n🛑 Shutting down frontend...', 'yellow');
        frontend.kill('SIGTERM');
    });
}

if (require.main === module) {
    startFrontend();
}