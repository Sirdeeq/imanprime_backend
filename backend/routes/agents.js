import express from 'express';
import { body } from 'express-validator';
import { adminAuth, authenticate } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';
import {
  createAgent,
  getAgents,
  getAgentById,
  updateAgent,
  deleteAgent,
  getActiveAgents
} from '../controllers/agentController.js';

const router = express.Router();

// Validation rules
const agentValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required'),
  body('specialization')
    .optional()
    .isIn(['residential', 'commercial', 'luxury', 'rental', 'investment'])
    .withMessage('Invalid specialization'),
  body('experience')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Experience must be a non-negative integer')
];

// File upload configuration
const agentUpload = upload.single('image');

// Public routes
router.get('/active', getActiveAgents);
router.get('/', getAgents);
router.get('/:id', getAgentById);

// Admin routes
router.post('/', adminAuth, agentUpload, agentValidation, createAgent);
router.put('/:id', adminAuth, agentUpload, agentValidation, updateAgent);
router.delete('/:id', adminAuth, deleteAgent);

export default router;