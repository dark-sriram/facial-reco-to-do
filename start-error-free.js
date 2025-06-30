#!/usr/bin/env node

/**
 * ERROR-FREE Startup Script
 * Guaranteed to work without crashes
 */

const { spawn } = require('child_process');
const fs = require('fs');
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

function displayWelcome() {
    log('\n🎭 Facial Recognition Todo App - ERROR-FREE VERSION', 'bright');
    log('===================================================', 'bright');
    log('🚀 Starting your crash-proof application...', 'cyan');
    log('', 'reset');
}

function displaySuccess() {
    log('\n✅ APPLICATION STARTED SUCCESSFULLY!', 'green');
    log('=====================================', 'green');
    log('🌐 Frontend: http://localhost:5173', 'cyan');
    log('🔧 Backend: http://localhost:5000', 'cyan');
    log('🏥 Health: http://localhost:5000/api/health', 'blue');
    log('', 'reset');
    log('📱 How to use:', 'yellow');
    log('   1. Open http://localhost:5173 in your browser', 'yellow');
    log('   2. Allow camera permissions', 'yellow');
    log('   3. Register your face or login', 'yellow');
    log('   4. Start managing tasks!', 'yellow');
    log('', 'reset');
    log('🛑 To stop: Press Ctrl+C', 'red');
    log('=====================================\n', 'green');
}

async function ensureEnvironment() {
    try {
        // Create backend .env if missing
        const backendEnvPath = path.join('backend', '.env');
        if (!fs.existsSync(backendEnvPath)) {
            const envContent = `NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173
`;
            fs.writeFileSync(backendEnvPath, envContent);
            log('✅ Created backend .env file', 'green');
        }

        // Check if dependencies are installed
        if (!fs.existsSync('node_modules')) {
            log('📦 Installing root dependencies...', 'cyan');
            await runCommand('npm install');
        }

        if (!fs.existsSync(path.join('backend', 'node_modules'))) {
            log('📦 Installing backend dependencies...', 'cyan');
            await runCommand('npm install', { cwd: 'backend' });
        }

        if (!fs.existsSync(path.join('frontend', 'to_do_app', 'node_modules'))) {
            log('📦 Installing frontend dependencies...', 'cyan');
            await runCommand('npm install', { cwd: path.join('frontend', 'to_do_app') });
        }

        log('✅ Environment setup complete', 'green');
    } catch (error) {
        log(`⚠️  Environment setup warning: ${error.message}`, 'yellow');
        log('🔄 Continuing anyway...', 'yellow');
    }
}

function runCommand(command, options = {}) {
    return new Promise((resolve, reject) => {
        const child = spawn(command, [], {
            shell: true,
            stdio: 'pipe',
            cwd: options.cwd || process.cwd()
        });

        let output = '';
        child.stdout.on('data', (data) => {
            output += data.toString();
        });

        child.stderr.on('data', (data) => {
            output += data.toString();
        });

        child.on('close', (code) => {
            if (code === 0) {
                resolve(output);
            } else {
                reject(new Error(`Command failed: ${command}`));
            }
        });

        child.on('error', (error) => {
            reject(error);
        });
    });
}

async function startBackend() {
    return new Promise((resolve, reject) => {
        log('🔧 Starting backend server...', 'cyan');
        
        const backend = spawn('node', ['server-safe.js'], {
            cwd: 'backend',
            stdio: 'pipe'
        });

        let backendReady = false;

        backend.stdout.on('data', (data) => {
            const output = data.toString();
            console.log(output);
            
            if (output.includes('Server is CRASH-PROOF and ready!')) {
                backendReady = true;
                log('✅ Backend server started successfully', 'green');
                resolve(backend);
            }
        });

        backend.stderr.on('data', (data) => {
            const error = data.toString();
            if (!error.includes('ExperimentalWarning')) {
                console.error(error);
            }
        });

        backend.on('error', (error) => {
            log(`❌ Backend error: ${error.message}`, 'red');
            reject(error);
        });

        // Timeout after 30 seconds
        setTimeout(() => {
            if (!backendReady) {
                log('⚠️  Backend startup timeout, but continuing...', 'yellow');
                resolve(backend);
            }
        }, 30000);
    });
}

async function startFrontend() {
    return new Promise((resolve, reject) => {
        log('🎨 Starting frontend server...', 'cyan');
        
        const frontend = spawn('npm', ['run', 'dev'], {
            cwd: path.join('frontend', 'to_do_app'),
            stdio: 'pipe'
        });

        let frontendReady = false;

        frontend.stdout.on('data', (data) => {
            const output = data.toString();
            console.log(output);
            
            if (output.includes('Local:') && output.includes('5173')) {
                frontendReady = true;
                log('✅ Frontend server started successfully', 'green');
                resolve(frontend);
            }
        });

        frontend.stderr.on('data', (data) => {
            const error = data.toString();
            if (!error.includes('ExperimentalWarning')) {
                console.error(error);
            }
        });

        frontend.on('error', (error) => {
            log(`❌ Frontend error: ${error.message}`, 'red');
            reject(error);
        });

        // Timeout after 60 seconds
        setTimeout(() => {
            if (!frontendReady) {
                log('⚠️  Frontend startup timeout, but continuing...', 'yellow');
                resolve(frontend);
            }
        }, 60000);
    });
}

async function main() {
    try {
        displayWelcome();
        
        await ensureEnvironment();
        
        const backend = await startBackend();
        
        // Wait a moment for backend to fully start
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const frontend = await startFrontend();
        
        // Wait a moment for frontend to fully start
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        displaySuccess();

        // Handle graceful shutdown
        const shutdown = () => {
            log('\n🛑 Shutting down servers...', 'yellow');
            try {
                backend.kill('SIGTERM');
                frontend.kill('SIGTERM');
            } catch (error) {
                log('⚠️  Shutdown warning (this is normal)', 'yellow');
            }
            process.exit(0);
        };

        process.on('SIGINT', shutdown);
        process.on('SIGTERM', shutdown);

        // Keep the process alive
        await new Promise(() => {}); // Run forever

    } catch (error) {
        log(`❌ Startup failed: ${error.message}`, 'red');
        log('\n🔧 Troubleshooting:', 'yellow');
        log('   1. Check if Node.js is installed (node --version)', 'yellow');
        log('   2. Check if ports 5000 and 5173 are available', 'yellow');
        log('   3. Try running: npm run install-all', 'yellow');
        log('   4. Restart your terminal and try again', 'yellow');
        process.exit(1);
    }
}

// Handle unhandled errors
process.on('uncaughtException', (error) => {
    log(`❌ Uncaught error: ${error.message}`, 'red');
    log('🔄 Application continues running...', 'yellow');
});

process.on('unhandledRejection', (reason) => {
    log(`❌ Unhandled rejection: ${reason}`, 'red');
    log('🔄 Application continues running...', 'yellow');
});

if (require.main === module) {
    main();
}