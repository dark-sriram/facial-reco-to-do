import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import { Camera, UserPlus, LogIn, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const FaceLogin = ({ onLogin, onRegister }) => {
    const webcamRef = useRef(null);
    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);
    const [mode, setMode] = useState('login'); // 'login' or 'register'
    const [userName, setUserName] = useState('');
    const [debugMode, setDebugMode] = useState(false);
    const [debugInfo, setDebugInfo] = useState('');

    useEffect(() => {
        loadModels();
    }, []);

    const loadModels = async () => {
        try {
            console.log('Starting to load face recognition models...');
            
            // Try CDN first, then fallback to local
            const MODEL_URLS = [
                'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights',
                '/models' // fallback to local models
            ];
            
            let modelsLoaded = false;
            
            for (const MODEL_URL of MODEL_URLS) {
                try {
                    console.log(`Trying to load models from: ${MODEL_URL}`);
                    
                    // Load models one by one with progress tracking
                    console.log('Loading TinyFaceDetector...');
                    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
                    
                    console.log('Loading FaceLandmark68Net...');
                    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
                    
                    console.log('Loading FaceRecognitionNet...');
                    await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
                    
                    modelsLoaded = true;
                    break;
                } catch (urlError) {
                    console.warn(`Failed to load from ${MODEL_URL}:`, urlError);
                    continue;
                }
            }
            
            if (modelsLoaded) {
                console.log('All models loaded successfully!');
                setIsModelLoaded(true);
                setDebugInfo('✅ Models loaded successfully');
                toast.success('Face recognition models loaded successfully!');
            } else {
                throw new Error('Failed to load models from all sources');
            }
        } catch (error) {
            console.error('Error loading models:', error);
            toast.error('Failed to load face recognition models. Please check your internet connection and try refreshing the page.');
            
            // Show a more detailed error message
            setTimeout(() => {
                toast.error('Troubleshooting tips:\n1. Check internet connection\n2. Refresh the page\n3. Try a different browser\n4. Disable ad blockers');
            }, 2000);
        }
    };

    const captureAndProcess = async () => {
        if (!isModelLoaded) {
            toast.error('Models are still loading. Please wait...');
            return;
        }

        if (!webcamRef.current) {
            toast.error('Camera not available. Please check camera permissions.');
            return;
        }

        setIsCapturing(true);

        try {
            console.log('Capturing image from webcam...');
            const imageSrc = webcamRef.current.getScreenshot();
            
            if (!imageSrc) {
                toast.error('Failed to capture image from camera');
                setIsCapturing(false);
                return;
            }

            console.log('Creating image element...');
            const img = await createImageElement(imageSrc);
            
            console.log('Detecting face...');
            // Use more lenient detection options
            const detection = await faceapi
                .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({
                    inputSize: 416,
                    scoreThreshold: 0.3 // Lower threshold for better detection
                }))
                .withFaceLandmarks()
                .withFaceDescriptor();

            console.log('Detection result:', detection);

            if (!detection) {
                toast.error('No face detected. Please ensure:\n• Your face is clearly visible\n• Good lighting conditions\n• Face is centered in the camera');
                setIsCapturing(false);
                return;
            }

            console.log('Face detected successfully! Extracting descriptor...');
            const faceDescriptor = Array.from(detection.descriptor);
            console.log('Face descriptor length:', faceDescriptor.length);

            if (mode === 'register') {
                if (!userName.trim()) {
                    toast.error('Please enter your name');
                    setIsCapturing(false);
                    return;
                }
                console.log('Registering user...');
                await registerUser(userName, faceDescriptor, imageSrc);
            } else {
                console.log('Authenticating user...');
                await authenticateUser(faceDescriptor);
            }

        } catch (error) {
            console.error('Error processing face:', error);
            toast.error(`Error processing face: ${error.message}. Please try again.`);
        }

        setIsCapturing(false);
    };

    const createImageElement = (imageSrc) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = imageSrc;
        });
    };

    const registerUser = async (name, faceDescriptor, profileImage) => {
        try {
            console.log('Sending registration request...');
            console.log('Name:', name);
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

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);

            if (response.ok) {
                toast.success('Registration successful!');
                onRegister({
                    id: data.userId,
                    name: data.name
                });
            } else {
                toast.error(data.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            toast.error(`Registration failed: ${error.message}. Please check if the server is running.`);
        }
    };

    const authenticateUser = async (faceDescriptor) => {
        try {
            const response = await fetch('http://localhost:5000/api/users/authenticate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ faceDescriptor }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                toast.success(`Welcome back, ${data.user.name}!`);
                onLogin(data.user);
            } else {
                toast.error('Face not recognized. Please try again or register.');
            }
        } catch (error) {
            console.error('Authentication error:', error);
            toast.error('Authentication failed. Please try again.');
        }
    };

    const testFaceDetection = async () => {
        if (!isModelLoaded) {
            toast.error('Models are still loading. Please wait...');
            return;
        }

        if (!webcamRef.current) {
            toast.error('Camera not available. Please check camera permissions.');
            return;
        }

        try {
            console.log('Testing face detection...');
            const imageSrc = webcamRef.current.getScreenshot();
            
            if (!imageSrc) {
                toast.error('Failed to capture image from camera');
                return;
            }

            const img = await createImageElement(imageSrc);
            
            // Test with multiple detection options
            const detections = await faceapi.detectAllFaces(img, new faceapi.TinyFaceDetectorOptions({
                inputSize: 416,
                scoreThreshold: 0.3
            }));

            console.log('Detections found:', detections.length);
            
            if (detections.length === 0) {
                toast.error('No faces detected. Please:\n• Ensure good lighting\n• Face the camera directly\n• Move closer to the camera');
            } else if (detections.length === 1) {
                toast.success('✅ Face detected successfully! You can now register or login.');
            } else {
                toast.warning(`${detections.length} faces detected. Please ensure only one person is in the frame.`);
            }
        } catch (error) {
            console.error('Face detection test error:', error);
            toast.error(`Face detection test failed: ${error.message}`);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 max-w-md w-full mx-4">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Face Recognition To-Do
                    </h1>
                    <p className="text-gray-300">
                        {mode === 'login' ? 'Look at the camera to login' : 'Register your face'}
                    </p>
                </div>

                <div className="mb-6">
                    <div className="relative rounded-lg overflow-hidden bg-black">
                        <Webcam
                            ref={webcamRef}
                            audio={false}
                            screenshotFormat="image/jpeg"
                            className="w-full h-64 object-cover"
                            mirrored={true}
                            onUserMedia={() => {
                                console.log('Camera access granted');
                                setDebugInfo('✅ Camera access granted');
                            }}
                            onUserMediaError={(error) => {
                                console.error('Camera access error:', error);
                                setDebugInfo(`❌ Camera error: ${error.message}`);
                                toast.error('Camera access denied. Please allow camera permissions and refresh the page.');
                            }}
                            videoConstraints={{
                                width: 640,
                                height: 480,
                                facingMode: "user"
                            }}
                        />
                        {!isModelLoaded && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                <div className="text-white text-center">
                                    <Loader className="animate-spin mx-auto mb-2" size={24} />
                                    <p>Loading face recognition models...</p>
                                    <p className="text-sm mt-1">This may take 10-30 seconds</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {mode === 'register' && (
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Enter your name"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                )}

                <div className="space-y-3">
                    {/* Test Face Detection Button */}
                    <button
                        onClick={testFaceDetection}
                        disabled={!isModelLoaded}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <Camera size={16} />
                        Test Face Detection
                    </button>

                    <button
                        onClick={captureAndProcess}
                        disabled={!isModelLoaded || isCapturing}
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

                    <div className="flex gap-2">
                        <button
                            onClick={() => setMode('login')}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                                mode === 'login'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                            }`}
                        >
                            <LogIn size={16} />
                            Login
                        </button>
                        <button
                            onClick={() => setMode('register')}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                                mode === 'register'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                            }`}
                        >
                            <UserPlus size={16} />
                            Register
                        </button>
                    </div>
                </div>

                <div className="mt-6 text-center text-sm text-gray-400 space-y-2">
                    <p>Your face data is securely stored and used only for authentication.</p>
                    <div className="text-xs space-y-1">
                        <p>Status: {isModelLoaded ? '✅ Models Loaded' : '⏳ Loading Models...'}</p>
                        <p>Camera: {webcamRef.current ? '✅ Ready' : '❌ Not Ready'}</p>
                        {debugInfo && <p>Debug: {debugInfo}</p>}
                    </div>
                    <button
                        onClick={() => setDebugMode(!debugMode)}
                        className="text-xs text-blue-400 hover:text-blue-300 underline"
                    >
                        {debugMode ? 'Hide' : 'Show'} Debug Info
                    </button>
                    {debugMode && (
                        <div className="text-xs bg-gray-800 p-2 rounded mt-2 text-left">
                            <p><strong>Browser:</strong> {navigator.userAgent.split(' ')[0]}</p>
                            <p><strong>Camera Available:</strong> {navigator.mediaDevices ? 'Yes' : 'No'}</p>
                            <p><strong>WebRTC Support:</strong> {window.RTCPeerConnection ? 'Yes' : 'No'}</p>
                            <p><strong>Backend URL:</strong> http://localhost:5000</p>
                            <p><strong>Models Source:</strong> CDN + Local Fallback</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FaceLogin;