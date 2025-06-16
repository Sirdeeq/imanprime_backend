import express from 'express';
import { body } from 'express-validator';
import { adminAuth, authenticate } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';
import {
  createBlog,
  getBlogs,
  getBlogById,
  getFeaturedBlogs,
  updateBlog,
  deleteBlog,
  likeBlog
} from '../controllers/blogController.js';

const router = express.Router();

// Validation rules
const blogValidation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('content')
    .trim()
    .isLength({ min: 100 })
    .withMessage('Content must be at least 100 characters long'),
  body('excerpt')
    .trim()
    .isLength({ min: 10, max: 300 })
    .withMessage('Excerpt must be between 10 and 300 characters'),
  body('author')
    .trim()
    .notEmpty()
    .withMessage('Author is required'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Invalid status')
];

// File upload configuration
const blogUpload = upload.single('image');

// Public routes
router.get('/featured', getFeaturedBlogs);
router.get('/', getBlogs);
router.get('/:id', getBlogById);
router.post('/:id/like', likeBlog);

// Admin routes
router.post('/', adminAuth, blogUpload, blogValidation, createBlog);
router.put('/:id', adminAuth, blogUpload, blogValidation, updateBlog);
router.delete('/:id', adminAuth, deleteBlog);

export default router;