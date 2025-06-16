import { validationResult } from 'express-validator';
import Blog from '../models/Blog.js';
import { deleteImage, getPublicIdFromUrl } from '../config/cloudinary.js';

// Create new blog post (Admin only)
export const createBlog = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const blogData = {
      ...req.body,
      createdBy: req.user._id
    };

    // Handle image upload
    if (req.file) {
      blogData.image = req.file.path;
    }

    // Parse tags if they're sent as string
    if (typeof blogData.tags === 'string') {
      blogData.tags = blogData.tags.split(',').map(tag => tag.trim());
    }

    // Calculate read time based on content length
    const wordsPerMinute = 200;
    const wordCount = blogData.content.split(' ').length;
    blogData.readTime = Math.ceil(wordCount / wordsPerMinute);

    const blog = new Blog(blogData);
    await blog.save();

    const populatedBlog = await Blog.findById(blog._id)
      .populate('createdBy', 'username email');

    res.status(201).json({
      success: true,
      message: 'Blog post created successfully',
      data: { blog: populatedBlog }
    });

  } catch (error) {
    console.error('Create blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating blog post',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all blog posts with filtering and pagination
export const getBlogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      search,
      tags,
      featured,
      sort = '-publishDate'
    } = req.query;

    // Build filter object
    const filter = {};
    
    // Only show published blogs to public
    if (req.user?.role !== 'admin') {
      filter.status = 'published';
      filter.publishDate = { $lte: new Date() };
    } else if (status) {
      filter.status = status;
    }

    if (category) filter.category = category;
    if (featured !== undefined) filter.featured = featured === 'true';

    // Tags filter
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      filter.tags = { $in: tagArray };
    }

    // Text search
    if (search) {
      filter.$text = { $search: search };
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort,
      populate: [
        { path: 'createdBy', select: 'username email' }
      ]
    };

    const blogs = await Blog.paginate(filter, options);

    res.json({
      success: true,
      data: {
        blogs: blogs.docs,
        pagination: {
          currentPage: blogs.page,
          totalPages: blogs.totalPages,
          totalBlogs: blogs.totalDocs,
          hasNextPage: blogs.hasNextPage,
          hasPrevPage: blogs.hasPrevPage
        }
      }
    });

  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching blog posts',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get single blog post by ID or slug
export const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    let blog;

    // Try to find by ID first, then by slug
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      blog = await Blog.findById(id).populate('createdBy', 'username email');
    } else {
      blog = await Blog.findOne({ slug: id }).populate('createdBy', 'username email');
    }

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    // Check if user can view this blog
    if (blog.status !== 'published' && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Blog post not available'
      });
    }

    // Increment views count
    await Blog.findByIdAndUpdate(blog._id, { $inc: { views: 1 } });

    res.json({
      success: true,
      data: { blog }
    });

  } catch (error) {
    console.error('Get blog by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching blog post',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get featured blog posts for landing page
export const getFeaturedBlogs = async (req, res) => {
  try {
    const featuredBlogs = await Blog.find({
      status: 'published',
      featured: true,
      publishDate: { $lte: new Date() }
    })
    .populate('createdBy', 'username')
    .limit(6)
    .sort('-publishDate');

    res.json({
      success: true,
      data: { blogs: featuredBlogs }
    });

  } catch (error) {
    console.error('Get featured blogs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching featured blog posts',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update blog post (Admin only)
export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const existingBlog = await Blog.findById(id);
    if (!existingBlog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    const updateData = { ...req.body };

    // Handle image upload
    if (req.file) {
      // Delete old image
      if (existingBlog.image) {
        const publicId = getPublicIdFromUrl(existingBlog.image);
        if (publicId) await deleteImage(publicId);
      }
      updateData.image = req.file.path;
    }

    // Parse tags if they're sent as string
    if (typeof updateData.tags === 'string') {
      updateData.tags = updateData.tags.split(',').map(tag => tag.trim());
    }

    // Recalculate read time if content changed
    if (updateData.content) {
      const wordsPerMinute = 200;
      const wordCount = updateData.content.split(' ').length;
      updateData.readTime = Math.ceil(wordCount / wordsPerMinute);
    }

    const blog = await Blog.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    }).populate('createdBy', 'username email');

    res.json({
      success: true,
      message: 'Blog post updated successfully',
      data: { blog }
    });

  } catch (error) {
    console.error('Update blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating blog post',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete blog post (Admin only)
export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    // Delete associated image from Cloudinary
    if (blog.image) {
      const publicId = getPublicIdFromUrl(blog.image);
      if (publicId) await deleteImage(publicId);
    }

    await Blog.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Blog post deleted successfully'
    });

  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting blog post',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Like blog post
export const likeBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findByIdAndUpdate(
      id,
      { $inc: { likes: 1 } },
      { new: true }
    );

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    res.json({
      success: true,
      message: 'Blog post liked successfully',
      data: { likes: blog.likes }
    });

  } catch (error) {
    console.error('Like blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error liking blog post',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};