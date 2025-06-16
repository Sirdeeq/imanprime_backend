import express from 'express';
import { body } from 'express-validator';
import { adminAuth } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';
import {
  getCompanyInfo,
  updateCompanyInfo,
  getCompanyContacts,
  getCompanyTeam,
  getCompanyPartners
} from '../controllers/companyController.js';

const router = express.Router();

// Validation rules
const companyValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
  body('about.vision')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Vision must be between 10 and 1000 characters'),
  body('about.mission')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Mission must be between 10 and 1000 characters')
];

// File upload configuration
const companyUpload = upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'teamImages', maxCount: 20 },
  { name: 'partnerLogos', maxCount: 50 }
]);

// Public routes
router.get('/', getCompanyInfo);
router.get('/contacts', getCompanyContacts);
router.get('/team', getCompanyTeam);
router.get('/partners', getCompanyPartners);

// Admin routes
router.put('/', adminAuth, companyUpload, companyValidation, updateCompanyInfo);

export default router;