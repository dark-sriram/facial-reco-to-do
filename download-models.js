const https = require('https');
const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, 'frontend', 'to_do_app', 'public', 'models');

// Ensure models directory exists
if (!fs.existsSync(modelsDir)) {
    fs.mkdirSync(modelsDir, { recursive: true });
}

const models = [
    'tiny_face_detector_model-weights_manifest.json',
    'tiny_face_detector_model-shard1',
    'face_landmark_68_model-weights_manifest.json',
    'face_landmark_68_model-shard1',
    'face_recognition_model-weights_manifest.json',
    'face_recognition_model-shard1',
    'face_recognition_model-shard2'
];

const baseUrl = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/';

function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log(`✅ Downloaded: ${path.basename(dest)}`);
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => {}); // Delete the file async
            reject(err);
        });
    });
}

async function downloadModels() {
    console.log('📥 Downloading face-api.js models...');
    console.log(`📁 Target directory: ${modelsDir}`);
    
    for (const model of models) {
        const url = baseUrl + model;
        const dest = path.join(modelsDir, model);
        
        try {
            console.log(`⏳ Downloading ${model}...`);
            await downloadFile(url, dest);
        } catch (error) {
            console.error(`❌ Failed to download ${model}:`, error.message);
        }
    }
    
    console.log('🎉 Model download complete!');
    console.log('💡 You can now use face recognition offline.');
}

downloadModels().catch(console.error);