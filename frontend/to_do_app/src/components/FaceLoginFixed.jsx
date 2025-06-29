import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import toast from 'react-hot-toast';
import { Camera, Loader, User, RefreshCw } from 'lucide-react';

const FaceLoginFixed = ({ onLogin, onRegister }) => {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    
    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);
    const [mode, setMode] = useState('login');
    const [userName, setUserName] = useState('');
    const [modelLoadingProgress, setModelLoadingProgress] = useState('');
    const [cameraReady, setCameraReady] = useState(false);
    const [detectionResults, setDetectionResults] = useState(null);

    useEffect(() => {
        loadModels();
    }, []);

    const loadModels = async () => {
        try {
            setModelLoadingProgress('Starting model loading...');
            console.log('Loading face-api.js models...');

            // Use local models first, then CDN as fallback
            const MODEL_URLS = [
                '/models',
                'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights'
            ];

            let modelsLoaded = false;

            for (let i = 0; i < MODEL_URLS.length; i++) {
                const MODEL_URL = MODEL_URLS[i];
                try {
                    setModelLoadingProgress(`Trying source ${i + 1}/${MODEL_URLS.length}: ${MODEL_URL.includes('github') ? 'CDN' : 'Local'}`);
                    
                    console.log(`Loading from: ${MODEL_URL}`);
                    
                    setModelLoadingProgress('Loading TinyFaceDetector...');
                    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
                    
                    setModelLoadingProgress('Loading FaceLandmark68Net...');
                    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
                    
                    setModelLoadingProgress('Loading FaceRecognitionNet...');
                    await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
                    
                    modelsLoaded = true;
                    console.log(`Successfully loaded models from: ${MODEL_URL}`);
                    break;
                } catch (error) {
                    console.warn(`Failed to load from ${MODEL_URL}:`, error);
                    setModelLoadingProgress(`Failed from ${MODEL_URL.includes('github') ? 'CDN' : 'Local'}, trying next...`);
                    continue;
                }
            }

            if (modelsLoaded) {
                setIsModelLoaded(true);
                setModelLoadingProgress('✅ All models loaded successfully!');
                toast.success('Face recognition ready!');
                console.log('Face-API models loaded successfully');
            } else {
                throw new Error('Failed to load models from all sources');
            }
        } catch (error) {
            console.error('Model loading error:', error);
            setModelLoadingProgress('❌ Failed to load models');
            toast.error('Failed to load face recognition models. Please refresh the page.');
        }
    };

    const testFaceDetection = async () => {
        if (!isModelLoaded) {
            toast.error('Models are still loading...');
            return;
        }

        if (!webcamRef.current || !cameraReady) {
            toast.error('Camera not ready. Please wait or refresh the page.');
            return;
        }

        try {
            console.log('Testing face detection...');
            const imageSrc = webcamRef.current.getScreenshot();
            
            if (!imageSrc) {
                toast.error('Failed to capture image. Please check camera permissions.');
                return;
            }

            const img = await createImageElement(imageSrc);
            
            // Use multiple detection strategies
            const detectionOptions = [
                new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.3 }),
                new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.4 }),
                new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })
            ];

            let detections = null;
            for (const options of detectionOptions) {
                detections = await faceapi.detectAllFaces(img, options);
                if (detections.length > 0) break;
            }

            console.log('Detection results:', detections);
            setDetectionResults(detections);

            if (!detections || detections.length === 0) {
                toast.error('❌ No face detected. Please:\n• Ensure good lighting\n• Face the camera directly\n• Move closer to camera\n• Remove glasses if causing glare');
                return;
            }

            if (detections.length === 1) {
                toast.success('✅ Perfect! One face detected clearly.');
                return true;
            } else {
                toast.warning(`⚠️ ${detections.length} faces detected. Please ensure only one person is visible.`);
                return false;
            }
        } catch (error) {
            console.error('Face detection test error:', error);
            toast.error(`Detection test failed: ${error.message}`);
            return false;
        }
    };

    const captureAndProcess = async () => {
        if (!isModelLoaded) {
            toast.error('Models are still loading. Please wait...');
            return;
        }

        if (!webcamRef.current || !cameraReady) {
            toast.error('Camera not ready. Please check permissions and try again.');
            return;
        }

        if (mode === 'register' && !userName.trim()) {
            toast.error('Please enter your name first.');
            return;
        }

        setIsCapturing(true);

        try {
            console.log('Starting face capture and processing...');
            
            // First test if face is detectable
            const faceDetected = await testFaceDetection();
            if (!faceDetected) {
                setIsCapturing(false);
                return;
            }

            const imageSrc = webcamRef.current.getScreenshot();
            const img = await createImageElement(imageSrc);
            
            console.log('Getting face descriptor...');
            const detection = await faceapi
                .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({ 
                    inputSize: 416, 
                    scoreThreshold: 0.3 
                }))
                .withFaceLandmarks()
                .withFaceDescriptor();

            if (!detection) {
                toast.error('Failed to get face features. Please try again with better lighting.');
                setIsCapturing(false);
                return;
            }

            const faceDescriptor = Array.from(detection.descriptor);
            console.log('Face descriptor extracted, length:', faceDescriptor.length);

            if (mode === 'register') {
                await registerUser(userName.trim(), faceDescriptor, imageSrc);
            } else {
                await authenticateUser(faceDescriptor);
            }

        } catch (error) {
            console.error('Face processing error:', error);
            toast.error(`Processing failed: ${error.message}`);
        } finally {
            setIsCapturing(false);
        }
    };

    const registerUser = async (name, faceDescriptor, profileImage) => {
        try {
            console.log('Registering user:', name);
            console.log('Face descriptor length:', faceDescriptor.length);

            const response = await fetch('http://localhost:5000/api/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    faceDescriptor,
                    profileImage
                }),
            });

            const data = await response.json();
            console.log('Registration response:', data);

            if (response.ok) {
                toast.success(`✅ Registration successful! Welcome, ${name}!`);
                onRegister({
                    id: data.userId,
                    name: data.name
                });
                console.log('User registered and logged in:', { id: data.userId, name: data.name });
            } else {
                toast.error(`Registration failed: ${data.message}`);
            }
        } catch (error) {
            console.error('Registration error:', error);
            toast.error(`Registration failed: ${error.message}. Please check if the server is running.`);
        }
    };

    const authenticateUser = async (faceDescriptor) => {
        try {
            console.log('Authenticating user...');
            
            const response = await fetch('http://localhost:5000/api/users/authenticate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ faceDescriptor }),
            });

            const data = await response.json();
            console.log('Authentication response:', data);

            if (response.ok && data.success) {
                toast.success(`✅ Welcome back, ${data.user.name}!`);
                onLogin(data.user);
                console.log('User authenticated and logged in:', data.user);
            } else {
                toast.error('❌ Face not recognized. Please try again or register first.');
            }
        } catch (error) {
            console.error('Authentication error:', error);
            toast.error(`Authentication failed: ${error.message}`);
        }
    };

    const createImageElement = (imageSrc) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = imageSrc;
        });
    };

    const handleCameraReady = () => {
        console.log('Camera is ready');
        setCameraReady(true);
        toast.success('Camera ready!');
    };

    const handleCameraError = (error) => {
        console.error('Camera error:', error);
        setCameraReady(false);
        toast.error('Camera access failed. Please allow camera permissions and refresh the page.');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md border border-white/20">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="text-white" size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">
                        Face Recognition Login
                    </h1>
                    <p className="text-blue-200 text-sm">
                        {mode === 'login' ? 'Look at the camera to login' : 'Register your face for secure access'}
                    </p>
                </div>

                {/* Mode Toggle */}
                <div className="flex bg-white/10 rounded-lg p-1 mb-6">
                    <button
                        onClick={() => setMode('login')}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                            mode === 'login'
                                ? 'bg-blue-500 text-white shadow-lg'
                                : 'text-blue-200 hover:text-white'
                        }`}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => setMode('register')}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                            mode === 'register'
                                ? 'bg-blue-500 text-white shadow-lg'
                                : 'text-blue-200 hover:text-white'
                        }`}
                    >
                        Register
                    </button>
                </div>

                {/* Name Input for Registration */}
                {mode === 'register' && (
                    <div className="mb-6">
                        <input
                            type="text"
                            placeholder="Enter your name"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                )}

                {/* Camera Feed */}
                <div className="mb-6">
                    <div className="relative rounded-lg overflow-hidden bg-black">
                        <Webcam
                            ref={webcamRef}
                            audio={false}
                            screenshotFormat="image/jpeg"
                            className="w-full h-64 object-cover"
                            mirrored={true}
                            onUserMedia={handleCameraReady}
                            onUserMediaError={handleCameraError}
                            videoConstraints={{
                                width: 640,
                                height: 480,
                                facingMode: "user"
                            }}
                        />
                        
                        {/* Loading Overlay */}
                        {(!isModelLoaded || !cameraReady) && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                                <div className="text-white text-center">
                                    <Loader className="animate-spin mx-auto mb-2" size={24} />
                                    <p className="text-sm">{modelLoadingProgress}</p>
                                    {!cameraReady && <p className="text-xs mt-1">Waiting for camera...</p>}
                                </div>
                            </div>
                        )}

                        {/* Detection Results Overlay */}
                        {detectionResults && detectionResults.length > 0 && (
                            <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                                {detectionResults.length} face(s) detected
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    {/* Test Detection Button */}
                    <button
                        onClick={testFaceDetection}
                        disabled={!isModelLoaded || !cameraReady}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <RefreshCw size={16} />
                        Test Face Detection
                    </button>

                    {/* Main Action Button */}
                    <button
                        onClick={captureAndProcess}
                        disabled={!isModelLoaded || !cameraReady || isCapturing}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        {isCapturing ? (
                            <>
                                <Loader className="animate-spin" size={20} />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Camera size={20} />
                                {mode === 'login' ? 'Login with Face' : 'Register Face'}
                            </>
                        )}
                    </button>
                </div>

                {/* Status Information */}
                <div className="mt-6 text-center text-sm text-blue-200 space-y-2">
                    <p>Your face data is securely stored and encrypted.</p>
                    <div className="text-xs space-y-1">
                        <p>Models: {isModelLoaded ? '✅ Ready' : '⏳ Loading...'}</p>
                        <p>Camera: {cameraReady ? '✅ Ready' : '❌ Not Ready'}</p>
                        <p>Backend: http://localhost:5000</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FaceLoginFixed;