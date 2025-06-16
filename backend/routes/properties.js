import express from 'express';
import { body } from 'express-validator';
import { adminAuth, authenticate } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';
import {
  createProperty,
  getProperties,
  getPropertyById,
  getLandingProperties,
  updateProperty,
  deleteProperty
} from '../controllers/propertyController.js';

const router = express.Router();

// Validation rules
const propertyValidation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('bedrooms')
    .isInt({ min: 0 })
    .withMessage('Bedrooms must be a non-negative integer'),
  body('bathrooms')
    .isFloat({ min: 0 })
    .withMessage('Bathrooms must be a non-negative number'),
  body('area')
    .trim()
    .notEmpty()
    .withMessage('Area is required'),
  body('agent')
    .isMongoId()
    .withMessage('Valid agent ID is required'),
  body('category')
    .isIn(['residential', 'commercial', 'luxury', 'rental', 'investment'])
    .withMessage('Invalid category'),
  body('status')
    .optional()
    .isIn(['draft', 'active', 'inactive', 'deleted'])
    .withMessage('Invalid status')
];

// File upload configuration
const propertyUpload = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'images', maxCount: 10 },
  { name: 'floor_plans', maxCount: 5 }
]);

// Public routes
router.get('/landing', getLandingProperties);
router.get('/', getProperties);
router.get('/:id', getPropertyById);

// Admin routes
router.post('/', adminAuth, propertyUpload, propertyValidation, createProperty);
router.put('/:id', adminAuth, propertyUpload, propertyValidation, updateProperty);
router.delete('/:id', adminAuth, deleteProperty);

export default router;