#!/usr/bin/env node

/**
 * One-Click Start Script for Facial Recognition Todo App
 * The simplest way to start the application
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

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

function displayWelcome() {
    log('\n🎭 Facial Recognition Todo App', 'bright');
    log('===============================', 'bright');
    log('🚀 Starting your intelligent task manager...', 'cyan');
    log('', 'reset');
}

function displayInstructions() {
    log('📱 How to use:', 'green');
    log('   1. Allow camera permissions when prompted', 'blue');
    log('   2. Register your face or login if already registered', 'blue');
    log('   3. Start managing your tasks with facial recognition!', 'blue');
    log('', 'reset');
    log('💡 Tips:', 'yellow');
    log('   • Ensure good lighting for face recognition', 'yellow');
    log('   • Look directly at the camera', 'yellow');
    log('   • Keep your face centered in the frame', 'yellow');
    log('', 'reset');
    log('🌐 Access your app at:', 'green');
    log('   Frontend: http://localhost:5173', 'cyan');
    log('   Backend API: http://localhost:5000/api', 'cyan');
    log('   Health Check: http://localhost:5000/api/health', 'cyan');
    log('', 'reset');
    log('🛑 To stop: Press Ctrl+C', 'red');
    log('===============================\n', 'bright');
}

async function checkPrerequisites() {
    // Check if package.json exists
    if (!fs.existsSync('package.json')) {
        log('❌ Error: package.json not found', 'red');
        log('Please run this script from the project root directory.', 'yellow');
        process.exit(1);
    }

    // Check if node_modules exists
    if (!fs.existsSync('node_modules')) {
        log('📦 Installing dependencies...', 'cyan');
        log('This may take a few minutes on first run.', 'yellow');
        
        try {
            await new Promise((resolve, reject) => {
                const install = spawn('npm', ['run', 'install-all'], {
                    stdio: 'inherit',
                    shell: true
                });
                
                install.on('close', (code) => {
                    if (code === 0) {
                        resolve();
                    } else {
                        reject(new Error(`Installation failed with code ${code}`));
                    }
                });
            });
            
            log('✅ Dependencies installed successfully!', 'green');
        } catch (error) {
            log('❌ Failed to install dependencies', 'red');
            log('Please run: npm run install-all', 'yellow');
            process.exit(1);
        }
    }
}

async function startApplication() {
    displayWelcome();
    
    try {
        await checkPrerequisites();
        
        log('🚀 Starting servers...', 'cyan');
        
        // Start the development servers with error handling
        const devProcess = spawn('npm', ['run', 'dev'], {
            stdio: 'pipe',
            shell: true
        });

        let backendStarted = false;
        let frontendStarted = false;

        devProcess.stdout.on('data', (data) => {
            const output = data.toString();
            console.log(output);
            
            // Check for successful startup messages
            if (output.includes('Ready for facial recognition authentication!')) {
                backendStarted = true;
            }
            if (output.includes('Local:') && output.includes('5173')) {
                frontendStarted = true;
            }
            
            // Display instructions once both are started
            if (backendStarted && frontendStarted && !global.instructionsShown) {
                global.instructionsShown = true;
                setTimeout(() => {
                    displayInstructions();
                }, 1000);
            }
        });

        devProcess.stderr.on('data', (data) => {
            const error = data.toString();
            // Filter out common warnings that aren't critical
            if (!error.includes('ExperimentalWarning') && 
                !error.includes('DeprecationWarning') &&
                !error.includes('punycode')) {
                console.error(error);
            }
        });

        // Handle process termination
        process.on('SIGINT', () => {
            log('\n🛑 Shutting down...', 'yellow');
            devProcess.kill('SIGINT');
            process.exit(0);
        });

        process.on('SIGTERM', () => {
            log('\n🛑 Shutting down...', 'yellow');
            devProcess.kill('SIGTERM');
            process.exit(0);
        });

        // Keep the process alive
        devProcess.on('close', (code) => {
            if (code !== 0) {
                log(`❌ Application exited with code ${code}`, 'red');
                log('🔄 Try running: npm run install-all', 'yellow');
            }
            process.exit(code);
        });

        devProcess.on('error', (error) => {
            log(`❌ Failed to start development servers: ${error.message}`, 'red');
            log('🔧 Troubleshooting:', 'yellow');
            log('   1. Run: npm run install-all', 'yellow');
            log('   2. Check if ports 5000 and 5173 are available', 'yellow');
            log('   3. Restart your terminal', 'yellow');
        });

    } catch (error) {
        log(`❌ Failed to start application: ${error.message}`, 'red');
        log('\n🔧 Try these solutions:', 'yellow');
        log('   1. Run: npm run install-all', 'yellow');
        log('   2. Check Node.js version (18+ required)', 'yellow');
        log('   3. Ensure ports 5000 and 5173 are available', 'yellow');
        process.exit(1);
    }
}

// Start the application
if (require.main === module) {
    startApplication();
}

module.exports = { startApplication };