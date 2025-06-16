import express from 'express';
import { body } from 'express-validator';
import { adminAuth } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';
import {
  createQuoteRequest,
  getQuoteRequests,
  getQuoteRequestById,
  updateQuoteRequest,
  addNoteToQuote,
  deleteQuoteRequest,
  getQuoteStatistics
} from '../controllers/quoteController.js';

const router = express.Router();

// Validation rules
const quoteValidation = [
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phoneNumber')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required'),
  body('projectType')
    .isIn([
      'interior-design',
      'exterior-design',
      'both-interior-exterior',
      'renovation',
      'new-construction',
      'commercial',
      'residential'
    ])
    .withMessage('Invalid project type'),
  body('budgetRange')
    .isIn([
      'under-10k',
      '10k-25k',
      '25k-50k',
      '50k-100k',
      '100k-250k',
      '250k-500k',
      'over-500k'
    ])
    .withMessage('Invalid budget range'),
  body('timeline')
    .isIn([
      'asap',
      '1-3-months',
      '3-6-months',
      '6-12-months',
      'over-1-year',
      'flexible'
    ])
    .withMessage('Invalid timeline'),
  body('projectDescription')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Project description must be between 10 and 2000 characters')
];

const updateQuoteValidation = [
  body('status')
    .optional()
    .isIn(['new', 'contacted', 'in-progress', 'quoted', 'accepted', 'rejected', 'completed'])
    .withMessage('Invalid status'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority'),
  body('assignedTo')
    .optional()
    .isMongoId()
    .withMessage('Invalid agent ID'),
  body('estimatedQuoteAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Estimated quote amount must be a positive number')
];

// File upload configuration
const quoteUpload = upload.fields([
  { name: 'attachments', maxCount: 10 }
]);

// Public routes
router.post('/', quoteUpload, quoteValidation, createQuoteRequest);

// Admin routes
router.get('/statistics', adminAuth, getQuoteStatistics);
router.get('/', adminAuth, getQuoteRequests);
router.get('/:id', adminAuth, getQuoteRequestById);
router.put('/:id', adminAuth, quoteUpload, updateQuoteValidation, updateQuoteRequest);
router.post('/:id/notes', adminAuth, addNoteToQuote);
router.delete('/:id', adminAuth, deleteQuoteRequest);

export default router;