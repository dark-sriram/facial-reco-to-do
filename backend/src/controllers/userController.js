import User from '../model/User.js';
import { db } from '../config/dbAdapter.js';

// Register a new user with face descriptor
export async function registerUser(req, res) {
    try {
        console.log('Registration request received');
        const { name, faceDescriptor, profileImage } = req.body;
        
        console.log('Name:', name);
        console.log('Face descriptor type:', typeof faceDescriptor);
        console.log('Face descriptor length:', faceDescriptor ? faceDescriptor.length : 'undefined');
        
        if (!name || !faceDescriptor) {
            console.log('Missing required fields');
            return res.status(400).json({ message: 'Name and face descriptor are required' });
        }

        if (!Array.isArray(faceDescriptor) || faceDescriptor.length === 0) {
            console.log('Invalid face descriptor format');
            return res.status(400).json({ message: 'Invalid face descriptor format' });
        }

        // Check if user already exists
        const existingUser = await db.findUserByName(name);
        if (existingUser) {
            console.log('User already exists:', name);
            return res.status(400).json({ message: 'User with this name already exists' });
        }

        console.log('Creating new user...');
        const newUser = await db.createUser({ 
            name, 
            faceDescriptor,
            profileImage 
        });

        console.log('User saved successfully:', newUser._id || newUser.id);
        
        res.status(201).json({ 
            message: 'User registered successfully!',
            userId: newUser._id || newUser.id,
            name: newUser.name
        });
    } catch (error) {
        console.error('Error in registerUser controller:', error);
        res.status(500).json({ 
            message: 'Internal server error',
            error: error.message 
        });
    }
}

// Get all users for face matching
export async function getAllUsers(req, res) {
    try {
        console.log('GET /users request received');
        const users = await db.findAllUsers();
        console.log(`Found ${users.length} users`);
        res.status(200).json(users);
    } catch (error) {
        console.error('Error in getAllUsers controller:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// Authenticate user by face descriptor
export async function authenticateUser(req, res) {
    try {
        console.log('Authentication request received');
        const { faceDescriptor } = req.body;
        
        console.log('Face descriptor type:', typeof faceDescriptor);
        console.log('Face descriptor length:', faceDescriptor ? faceDescriptor.length : 'undefined');
        
        if (!faceDescriptor) {
            console.log('No face descriptor provided');
            return res.status(400).json({ message: 'Face descriptor is required' });
        }

        if (!Array.isArray(faceDescriptor) || faceDescriptor.length === 0) {
            console.log('Invalid face descriptor format');
            return res.status(400).json({ message: 'Invalid face descriptor format' });
        }

        // Get all users to compare face descriptors
        const users = await db.findAllUsers();
        console.log(`Found ${users.length} registered users for comparison`);
        
        if (users.length === 0) {
            console.log('No registered users found');
            return res.status(404).json({ 
                success: false, 
                message: 'No registered users found. Please register first.' 
            });
        }

        // Face matching with multiple thresholds
        let matchedUser = null;
        let minDistance = Infinity;
        const thresholds = [0.4, 0.5, 0.6]; // Try multiple thresholds
        
        console.log('Starting face comparison...');
        for (const user of users) {
            const distance = calculateEuclideanDistance(faceDescriptor, user.faceDescriptor);
            console.log(`Distance to ${user.name}: ${distance.toFixed(4)}`);
            
            if (distance < minDistance) {
                minDistance = distance;
                matchedUser = user;
            }
        }

        console.log(`Best match: ${matchedUser?.name} with distance: ${minDistance.toFixed(4)}`);

        // Check against thresholds
        let matched = false;
        for (const threshold of thresholds) {
            if (minDistance < threshold) {
                matched = true;
                console.log(`Match found with threshold ${threshold}`);
                break;
            }
        }

        if (matched && matchedUser) {
            console.log(`Authentication successful for user: ${matchedUser.name}`);
            res.status(200).json({
                success: true,
                user: {
                    id: matchedUser._id,
                    name: matchedUser.name,
                    profileImage: matchedUser.profileImage
                },
                confidence: (1 - minDistance).toFixed(4)
            });
        } else {
            console.log(`Authentication failed. Best distance: ${minDistance.toFixed(4)}`);
            res.status(404).json({ 
                success: false, 
                message: `No matching user found. Best match distance: ${minDistance.toFixed(4)}`,
                suggestion: minDistance < 0.8 ? 'Try again with better lighting' : 'Please register first'
            });
        }
    } catch (error) {
        console.error('Error in authenticateUser controller:', error);
        res.status(500).json({ 
            message: 'Internal server error',
            error: error.message 
        });
    }
}

// Helper function to calculate Euclidean distance between two face descriptors
function calculateEuclideanDistance(desc1, desc2) {
    if (desc1.length !== desc2.length) {
        return Infinity;
    }
    
    let sum = 0;
    for (let i = 0; i < desc1.length; i++) {
        sum += Math.pow(desc1[i] - desc2[i], 2);
    }
    return Math.sqrt(sum);
}

// Get user by ID
export async function getUserById(req, res) {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({
            id: user._id,
            name: user.name,
            profileImage: user.profileImage
        });
    } catch (error) {
        console.error('Error in getUserById controller', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}