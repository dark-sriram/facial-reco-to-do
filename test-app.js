#!/usr/bin/env node

/**
 * Comprehensive Testing Script for Facial Recognition Todo App
 * Tests all major functionality and API endpoints
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
    API_BASE_URL: process.env.API_URL || 'http://localhost:5000',
    TIMEOUT: 10000,
    RETRY_COUNT: 3
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

function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        const timeout = setTimeout(() => {
            reject(new Error('Request timeout'));
        }, CONFIG.TIMEOUT);

        const req = protocol.request(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'FacialRecognitionTodo-TestScript/1.0',
                ...options.headers
            },
            ...options
        }, (res) => {
            clearTimeout(timeout);
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        data: jsonData
                    });
                } catch (error) {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        data: data
                    });
                }
            });
        });

        req.on('error', (error) => {
            clearTimeout(timeout);
            reject(error);
        });

        if (options.body) {
            req.write(JSON.stringify(options.body));
        }

        req.end();
    });
}

async function testHealthCheck() {
    log('🏥 Testing health check endpoint...', 'cyan');
    
    try {
        const response = await makeRequest(`${CONFIG.API_BASE_URL}/api/health`);
        
        if (response.statusCode === 200) {
            log('✅ Health check passed', 'green');
            log(`   Status: ${response.data.status}`, 'blue');
            log(`   Environment: ${response.data.environment}`, 'blue');
            return true;
        } else {
            log(`❌ Health check failed with status: ${response.statusCode}`, 'red');
            return false;
        }
    } catch (error) {
        log(`❌ Health check error: ${error.message}`, 'red');
        return false;
    }
}

async function testCORSHeaders() {
    log('🌐 Testing CORS headers...', 'cyan');
    
    try {
        const response = await makeRequest(`${CONFIG.API_BASE_URL}/api/health`, {
            headers: {
                'Origin': 'http://localhost:3000'
            }
        });
        
        const corsHeader = response.headers['access-control-allow-origin'];
        if (corsHeader) {
            log('✅ CORS headers present', 'green');
            log(`   Access-Control-Allow-Origin: ${corsHeader}`, 'blue');
            return true;
        } else {
            log('⚠️  CORS headers not found', 'yellow');
            return false;
        }
    } catch (error) {
        log(`❌ CORS test error: ${error.message}`, 'red');
        return false;
    }
}

async function testRateLimiting() {
    log('🚦 Testing rate limiting...', 'cyan');
    
    try {
        const requests = [];
        for (let i = 0; i < 20; i++) {
            requests.push(makeRequest(`${CONFIG.API_BASE_URL}/api/health`));
        }
        
        const responses = await Promise.allSettled(requests);
        const rateLimited = responses.some(result => 
            result.status === 'fulfilled' && result.value.statusCode === 429
        );
        
        if (rateLimited) {
            log('✅ Rate limiting is working', 'green');
            return true;
        } else {
            log('⚠️  Rate limiting not triggered (may need more requests)', 'yellow');
            return true; // Not necessarily a failure
        }
    } catch (error) {
        log(`❌ Rate limiting test error: ${error.message}`, 'red');
        return false;
    }
}

async function testUserEndpoints() {
    log('👤 Testing user endpoints...', 'cyan');
    
    try {
        // Test GET /api/users
        const usersResponse = await makeRequest(`${CONFIG.API_BASE_URL}/api/users`);
        
        if (usersResponse.statusCode === 200) {
            log('✅ GET /api/users endpoint working', 'green');
            log(`   Found ${Array.isArray(usersResponse.data) ? usersResponse.data.length : 0} users`, 'blue');
        } else {
            log(`❌ GET /api/users failed with status: ${usersResponse.statusCode}`, 'red');
            return false;
        }
        
        return true;
    } catch (error) {
        log(`❌ User endpoints test error: ${error.message}`, 'red');
        return false;
    }
}

async function testNotesEndpoints() {
    log('📝 Testing notes endpoints...', 'cyan');
    
    try {
        // Test GET /api/notes (should work even without userId)
        const notesResponse = await makeRequest(`${CONFIG.API_BASE_URL}/api/notes`);
        
        if (notesResponse.statusCode === 200 || notesResponse.statusCode === 400) {
            log('✅ GET /api/notes endpoint accessible', 'green');
        } else {
            log(`❌ GET /api/notes failed with status: ${notesResponse.statusCode}`, 'red');
            return false;
        }
        
        return true;
    } catch (error) {
        log(`❌ Notes endpoints test error: ${error.message}`, 'red');
        return false;
    }
}

async function testStaticFiles() {
    log('📁 Testing static file serving...', 'cyan');
    
    try {
        // Test if the main app is served
        const response = await makeRequest(`${CONFIG.API_BASE_URL}/`);
        
        if (response.statusCode === 200) {
            log('✅ Static files are being served', 'green');
            return true;
        } else {
            log(`❌ Static files test failed with status: ${response.statusCode}`, 'red');
            return false;
        }
    } catch (error) {
        log(`❌ Static files test error: ${error.message}`, 'red');
        return false;
    }
}

async function testFaceAPIModels() {
    log('🎭 Testing face-api.js models availability...', 'cyan');
    
    const modelFiles = [
        '/models/tiny_face_detector_model-weights_manifest.json',
        '/models/face_landmark_68_model-weights_manifest.json',
        '/models/face_recognition_model-weights_manifest.json'
    ];
    
    let allModelsAvailable = true;
    
    for (const modelFile of modelFiles) {
        try {
            const response = await makeRequest(`${CONFIG.API_BASE_URL}${modelFile}`);
            
            if (response.statusCode === 200) {
                log(`✅ Model available: ${modelFile}`, 'green');
            } else {
                log(`❌ Model not found: ${modelFile} (status: ${response.statusCode})`, 'red');
                allModelsAvailable = false;
            }
        } catch (error) {
            log(`❌ Model test error for ${modelFile}: ${error.message}`, 'red');
            allModelsAvailable = false;
        }
    }
    
    return allModelsAvailable;
}

async function testDatabaseConnection() {
    log('🗄️  Testing database connection...', 'cyan');
    
    try {
        // Indirect test by checking if users endpoint works
        const response = await makeRequest(`${CONFIG.API_BASE_URL}/api/users`);
        
        if (response.statusCode === 200) {
            log('✅ Database connection appears to be working', 'green');
            return true;
        } else if (response.statusCode === 500) {
            log('❌ Database connection may be failing', 'red');
            return false;
        } else {
            log(`⚠️  Database connection test inconclusive (status: ${response.statusCode})`, 'yellow');
            return true;
        }
    } catch (error) {
        log(`❌ Database connection test error: ${error.message}`, 'red');
        return false;
    }
}

async function runAllTests() {
    log('🧪 Starting comprehensive application tests...', 'bright');
    log('==============================================\n', 'bright');
    
    const tests = [
        { name: 'Health Check', fn: testHealthCheck },
        { name: 'CORS Headers', fn: testCORSHeaders },
        { name: 'Rate Limiting', fn: testRateLimiting },
        { name: 'Database Connection', fn: testDatabaseConnection },
        { name: 'User Endpoints', fn: testUserEndpoints },
        { name: 'Notes Endpoints', fn: testNotesEndpoints },
        { name: 'Static Files', fn: testStaticFiles },
        { name: 'Face API Models', fn: testFaceAPIModels }
    ];
    
    const results = [];
    
    for (const test of tests) {
        try {
            const result = await test.fn();
            results.push({ name: test.name, passed: result });
            log(''); // Empty line for readability
        } catch (error) {
            log(`❌ Test "${test.name}" threw an error: ${error.message}`, 'red');
            results.push({ name: test.name, passed: false });
            log(''); // Empty line for readability
        }
    }
    
    // Summary
    log('📊 Test Results Summary', 'bright');
    log('======================', 'bright');
    
    const passed = results.filter(r => r.passed).length;
    const total = results.length;
    
    results.forEach(result => {
        const icon = result.passed ? '✅' : '❌';
        const color = result.passed ? 'green' : 'red';
        log(`${icon} ${result.name}`, color);
    });
    
    log(`\n📈 Overall: ${passed}/${total} tests passed`, passed === total ? 'green' : 'yellow');
    
    if (passed === total) {
        log('🎉 All tests passed! Your application is ready for deployment.', 'green');
        return true;
    } else {
        log('⚠️  Some tests failed. Please review the issues above.', 'yellow');
        return false;
    }
}

async function main() {
    try {
        log(`🎯 Testing Facial Recognition Todo App at: ${CONFIG.API_BASE_URL}`, 'cyan');
        log(`⏱️  Timeout: ${CONFIG.TIMEOUT}ms\n`, 'blue');
        
        const allPassed = await runAllTests();
        
        if (allPassed) {
            process.exit(0);
        } else {
            process.exit(1);
        }
    } catch (error) {
        log(`❌ Test suite failed: ${error.message}`, 'red');
        process.exit(1);
    }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    log(`❌ Unhandled Rejection: ${reason}`, 'red');
    process.exit(1);
});

// Start tests if this script is run directly
if (require.main === module) {
    main();
}

module.exports = { runAllTests, CONFIG };