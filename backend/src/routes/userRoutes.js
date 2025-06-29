import express from 'express';
import { 
    registerUser, 
    getAllUsers, 
    authenticateUser, 
    getUserById 
} from '../controllers/userController.js';

const router = express.Router();

// Register a new user
router.post('/register', registerUser);

// Get all users (for face matching)
router.get('/', getAllUsers);

// Authenticate user by face
router.post('/authenticate', authenticateUser);

// Get user by ID
router.get('/:id', getUserById);

export default router;