#!/usr/bin/env node

/**
 * Local Database Setup Script
 * Helps set up local MongoDB if Atlas is not available
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

function checkMongoDBInstalled() {
    return new Promise((resolve) => {
        const mongod = spawn('mongod', ['--version'], { shell: true });
        
        mongod.on('close', (code) => {
            resolve(code === 0);
        });
        
        mongod.on('error', () => {
            resolve(false);
        });
    });
}

function startLocalMongoDB() {
    return new Promise((resolve, reject) => {
        log('🚀 Starting local MongoDB...', 'cyan');
        
        const mongod = spawn('mongod', ['--dbpath', './data/db'], { 
            shell: true,
            stdio: 'inherit'
        });
        
        mongod.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`MongoDB exited with code ${code}`));
            }
        });
        
        mongod.on('error', (error) => {
            reject(error);
        });
    });
}

function createDataDirectory() {
    const dataDir = path.join(process.cwd(), 'data', 'db');
    
    if (!fs.existsSync(dataDir)) {
        log('📁 Creating data directory...', 'cyan');
        fs.mkdirSync(dataDir, { recursive: true });
        log('✅ Data directory created', 'green');
    } else {
        log('✅ Data directory already exists', 'green');
    }
}

function updateEnvFile() {
    const envPath = path.join(process.cwd(), 'backend', '.env');
    
    if (fs.existsSync(envPath)) {
        let envContent = fs.readFileSync(envPath, 'utf8');
        
        // Comment out Atlas URI and uncomment local URI
        envContent = envContent.replace(
            /^MONGO_URI=mongodb\+srv:/m,
            '# MONGO_URI=mongodb+srv:'
        );
        
        envContent = envContent.replace(
            /^# MONGO_URI=mongodb:\/\/localhost/m,
            'MONGO_URI=mongodb://localhost'
        );
        
        fs.writeFileSync(envPath, envContent);
        log('✅ Environment file updated for local MongoDB', 'green');
    }
}

async function main() {
    try {
        log('🔧 Local MongoDB Setup', 'bright');
        log('=====================\n', 'bright');
        
        const isMongoInstalled = await checkMongoDBInstalled();
        
        if (!isMongoInstalled) {
            log('❌ MongoDB is not installed locally', 'red');
            log('\n💡 Installation options:', 'yellow');
            log('   1. Download from: https://www.mongodb.com/try/download/community', 'yellow');
            log('   2. Use Docker: docker run -d -p 27017:27017 --name mongodb mongo', 'yellow');
            log('   3. Use MongoDB Atlas (cloud) - check your internet connection', 'yellow');
            return;
        }
        
        log('✅ MongoDB is installed', 'green');
        
        createDataDirectory();
        updateEnvFile();
        
        log('\n🚀 You can now start the application with local MongoDB:', 'green');
        log('   npm run dev', 'cyan');
        
        log('\n💡 To switch back to Atlas:', 'yellow');
        log('   1. Uncomment the Atlas URI in backend/.env', 'yellow');
        log('   2. Comment out the local URI', 'yellow');
        
    } catch (error) {
        log(`❌ Setup failed: ${error.message}`, 'red');
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { main };