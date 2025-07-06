import React, { useState, useRef, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import { toast } from 'react-hot-toast';
import { Camera, User, RefreshCw, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const EnhancedFaceLogin = ({ onLogin, onRegister }) => {
    const [isModelLoaded, setIsModelLoaded] = useState(false);
    const [isDetecting, setIsDetecting] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [detectionStatus, setDetectionStatus] = useState('idle'); // idle, detecting, success, error
    const [faceDetected, setFaceDetected] = useState(false);
    const [confidence, setConfidence] = useState(0);
    const [retryCount, setRetryCount] = useState(0);
    const [showRegistration, setShowRegistration] = useState(false);
    const [registrationName, setRegistrationName] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const detectionIntervalRef = useRef(null);
    const lastDetectionRef = useRef(null);

    // Enhanced model loading with progress tracking
    const loadModels = useCallback(async () => {
        try {
            setDetectionStatus('loading');
            const loadingToast = toast.loading('Loading face recognition models...');
            
            const MODEL_URL = '/models';
            const modelPromises = [
                faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
            ];

            await Promise.all(modelPromises);
            
            toast.dismiss(loadingToast);
            toast.success('Face recognition models loaded successfully!');
            setIsModelLoaded(true);
            setDetectionStatus('idle');
        } catch (error) {
            console.error('Error loading models:', error);
            toast.error('Failed to load face recognition models. Please refresh the page.');
            setDetectionStatus('error');
        }
    }, []);

    useEffect(() => {
        loadModels();
        return () => {
            if (detectionIntervalRef.current) {
                clearInterval(detectionIntervalRef.current);
            }
        };
    }, [loadModels]);

    // Enhanced face detection with better feedback
    const detectFace = useCallback(async () => {
        if (!webcamRef.current || !isModelLoaded || isDetecting) return;

        const video = webcamRef.current.video;
        if (!video || video.readyState !== 4) return;

        try {
            setIsDetecting(true);
            
            const detections = await faceapi
                .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({
                    inputSize: 416,
                    scoreThreshold: 0.5
                }))
                .withFaceLandmarks()
                .withFaceDescriptors();

            // Clear previous drawings
            if (canvasRef.current) {
                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                // Set canvas dimensions to match video
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
            }

            if (detections.length > 0) {
                const detection = detections[0];
                const confidence = detection.detection.score;
                
                setFaceDetected(true);
                setConfidence(confidence);
                setDetectionStatus('success');
                
                // Draw face detection box
                if (canvasRef.current) {
                    const canvas = canvasRef.current;
                    const ctx = canvas.getContext('2d');
                    const { x, y, width, height } = detection.detection.box;
                    
                    ctx.strokeStyle = confidence > 0.7 ? '#10B981' : '#F59E0B';
                    ctx.lineWidth = 3;
                    ctx.strokeRect(x, y, width, height);
                    
                    // Draw confidence score
                    ctx.fillStyle = confidence > 0.7 ? '#10B981' : '#F59E0B';
                    ctx.font = '16px Arial';
                    ctx.fillText(`${(confidence * 100).toFixed(1)}%`, x, y - 10);
                }
                
                lastDetectionRef.current = detection;
            } else {
                setFaceDetected(false);
                setConfidence(0);
                setDetectionStatus('detecting');
                lastDetectionRef.current = null;
            }
        } catch (error) {
            console.error('Face detection error:', error);
            setDetectionStatus('error');
            setFaceDetected(false);
        } finally {
            setIsDetecting(false);
        }
    }, [isModelLoaded, isDetecting]);

    // Start continuous face detection
    const startDetection = useCallback(() => {
        if (detectionIntervalRef.current) {
            clearInterval(detectionIntervalRef.current);
        }
        
        detectionIntervalRef.current = setInterval(detectFace, 500); // Detect every 500ms
        setDetectionStatus('detecting');
    }, [detectFace]);

    // Stop face detection
    const stopDetection = useCallback(() => {
        if (detectionIntervalRef.current) {
            clearInterval(detectionIntervalRef.current);
            detectionIntervalRef.current = null;
        }
        setDetectionStatus('idle');
        setFaceDetected(false);
    }, []);

    // Enhanced authentication with better error handling
    const handleAuthentication = async () => {
        if (!lastDetectionRef.current || !faceDetected) {
            toast.error('Please position your face in the camera view');
            return;
        }

        try {
            const loadingToast = toast.loading('Authenticating...');
            
            const faceDescriptor = Array.from(lastDetectionRef.current.descriptor);
            
            const response = await fetch(`${API_BASE_URL}/api/users/authenticate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ faceDescriptor }),
            });

            const data = await response.json();
            toast.dismiss(loadingToast);

            if (response.ok && data.success) {
                toast.success(`Welcome back, ${data.user.name}!`);
                setCurrentUser(data.user);
                stopDetection();
                onLogin(data.user);
            } else {
                setRetryCount(prev => prev + 1);
                if (retryCount >= 2) {
                    toast.error('Authentication failed multiple times. Would you like to register?');
                    setShowRegistration(true);
                } else {
                    toast.error(data.message || 'Authentication failed. Please try again.');
                }
            }
        } catch (error) {
            console.error('Authentication error:', error);
            toast.error('Network error. Please check your connection.');
        }
    };

    // Enhanced registration with validation
    const handleRegistration = async () => {
        if (!registrationName.trim()) {
            toast.error('Please enter your name');
            return;
        }

        if (!lastDetectionRef.current || !faceDetected) {
            toast.error('Please position your face in the camera view');
            return;
        }

        if (confidence < 0.7) {
            toast.error('Face detection confidence too low. Please improve lighting.');
            return;
        }

        try {
            setIsRegistering(true);
            const loadingToast = toast.loading('Registering your face...');
            
            const faceDescriptor = Array.from(lastDetectionRef.current.descriptor);
            
            const response = await fetch(`${API_BASE_URL}/api/users/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: registrationName.trim(),
                    faceDescriptor
                }),
            });

            const data = await response.json();
            toast.dismiss(loadingToast);

            if (response.ok) {
                toast.success(`Registration successful! Welcome, ${registrationName}!`);
                const user = { id: data.userId, name: registrationName };
                setCurrentUser(user);
                setShowRegistration(false);
                stopDetection();
                onRegister(user);
            } else {
                toast.error(data.message || 'Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Registration error:', error);
            toast.error('Network error. Please check your connection.');
        } finally {
            setIsRegistering(false);
        }
    };

    // Get status color and icon
    const getStatusDisplay = () => {
        switch (detectionStatus) {
            case 'loading':
                return { color: 'text-blue-500', icon: Loader, text: 'Loading models...' };
            case 'detecting':
                return { color: 'text-yellow-500', icon: RefreshCw, text: 'Detecting face...' };
            case 'success':
                return { color: 'text-green-500', icon: CheckCircle, text: 'Face detected!' };
            case 'error':
                return { color: 'text-red-500', icon: AlertCircle, text: 'Detection error' };
            default:
                return { color: 'text-gray-500', icon: Camera, text: 'Ready to detect' };
        }
    };

    const statusDisplay = getStatusDisplay();
    const StatusIcon = statusDisplay.icon;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Face Recognition To-do
                    </h1>
                    <p className="text-gray-600">
                        {showRegistration ? 'Register your face' : 'Login with your face'}
                    </p>
                </div>

                {/* Camera Section */}
                <div className="relative mb-6">
                    <div className="relative rounded-xl overflow-hidden bg-gray-900">
                        <Webcam
                            ref={webcamRef}
                            audio={false}
                            screenshotFormat="image/jpeg"
                            className="w-full h-64 object-cover"
                            onUserMedia={startDetection}
                            onUserMediaError={(error) => {
                                console.error('Camera error:', error);
                                toast.error('Camera access denied. Please allow camera permissions.');
                            }}
                        />
                        <canvas
                            ref={canvasRef}
                            className="absolute top-0 left-0 w-full h-full"
                            style={{ transform: 'scaleX(-1)' }}
                        />
                    </div>
                    
                    {/* Status Overlay */}
                    <div className="absolute bottom-4 left-4 right-4">
                        <div className="bg-black bg-opacity-70 rounded-lg p-3 text-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <StatusIcon 
                                        className={`w-5 h-5 ${statusDisplay.color} ${
                                            detectionStatus === 'detecting' ? 'animate-spin' : ''
                                        }`} 
                                    />
                                    <span className="text-sm">{statusDisplay.text}</span>
                                </div>
                                {faceDetected && (
                                    <div className="text-sm">
                                        {(confidence * 100).toFixed(1)}%
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Registration Form */}
                {showRegistration && (
                    <div className="mb-6">
                        <input
                            type="text"
                            placeholder="Enter your name"
                            value={registrationName}
                            onChange={(e) => setRegistrationName(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            onKeyPress={(e) => e.key === 'Enter' && handleRegistration()}
                        />
                    </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                    {showRegistration ? (
                        <>
                            <button
                                onClick={handleRegistration}
                                disabled={!isModelLoaded || !faceDetected || isRegistering}
                                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                            >
                                {isRegistering ? (
                                    <>
                                        <Loader className="w-5 h-5 animate-spin" />
                                        <span>Registering...</span>
                                    </>
                                ) : (
                                    <>
                                        <User className="w-5 h-5" />
                                        <span>Register Face</span>
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => {
                                    setShowRegistration(false);
                                    setRetryCount(0);
                                }}
                                className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                            >
                                Back to Login
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={handleAuthentication}
                                disabled={!isModelLoaded || !faceDetected}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                            >
                                <Camera className="w-5 h-5" />
                                <span>Login with Face</span>
                            </button>
                            <button
                                onClick={() => setShowRegistration(true)}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                            >
                                <User className="w-5 h-5" />
                                <span>Register New Face</span>
                            </button>
                        </>
                    )}
                </div>

                {/* Tips */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-black mb-2"> Tips for better recognition:</h3>
                    <ul className="text-sm text-black space-y-1">
                        <li>• Ensure good lighting on your face</li>
                        <li>• Look directly at the camera</li>
                        <li>• Keep your face centered in the frame</li>
                        <li>• Remove glasses if possible</li>
                    </ul>
                </div>

                {/* Retry Counter */}
                {retryCount > 0 && (
                    <div className="mt-4 text-center text-sm text-gray-600">
                        Authentication attempts: {retryCount}/3
                    </div>
                )}
            </div>
        </div>
    );
};

export default EnhancedFaceLogin;