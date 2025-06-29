import * as faceapi from 'face-api.js';

class FaceRecognitionService {
    constructor() {
        this.isModelLoaded = false;
    }

    // Load face-api models
    async loadModels() {
        if (this.isModelLoaded) return;

        try {
            // Use CDN for models
            const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
            
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
            ]);
            
            this.isModelLoaded = true;
            console.log('Face recognition models loaded successfully');
        } catch (error) {
            console.error('Error loading face recognition models:', error);
            throw error;
        }
    }

    // Get face descriptor from image
    async getFaceDescriptor(imageElement) {
        try {
            if (!this.isModelLoaded) {
                await this.loadModels();
            }

            const detection = await faceapi
                .detectSingleFace(imageElement, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceDescriptor();

            if (!detection) {
                throw new Error('No face detected in the image');
            }

            return Array.from(detection.descriptor);
        } catch (error) {
            console.error('Error getting face descriptor:', error);
            throw error;
        }
    }

    // Compare two face descriptors
    compareFaces(descriptor1, descriptor2, threshold = 0.6) {
        if (!descriptor1 || !descriptor2) return false;
        
        const distance = faceapi.euclideanDistance(descriptor1, descriptor2);
        return distance < threshold;
    }

    // Find best match from array of known faces
    findBestMatch(inputDescriptor, knownFaces, threshold = 0.6) {
        let bestMatch = null;
        let minDistance = Infinity;

        knownFaces.forEach((face, index) => {
            const distance = faceapi.euclideanDistance(inputDescriptor, face.descriptor);
            if (distance < threshold && distance < minDistance) {
                minDistance = distance;
                bestMatch = { ...face, distance, index };
            }
        });

        return bestMatch;
    }

    // Capture image from video stream
    captureImageFromVideo(videoElement) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        
        context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        
        return canvas.toDataURL('image/jpeg', 0.8);
    }

    // Convert data URL to image element
    dataURLToImage(dataURL) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = dataURL;
        });
    }
}

export default new FaceRecognitionService();