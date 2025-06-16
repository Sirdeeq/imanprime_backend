import { validationResult } from 'express-validator';
import QuoteRequest from '../models/QuoteRequest.js';
import Agent from '../models/Agent.js';
import { deleteImage, getPublicIdFromUrl } from '../config/cloudinary.js';

// Create new quote request (Public)
export const createQuoteRequest = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const quoteData = { ...req.body };

    // Handle file attachments
    if (req.files?.attachments) {
      quoteData.attachments = req.files.attachments.map(file => ({
        name: file.originalname,
        url: file.path
      }));
    }

    const quoteRequest = new QuoteRequest(quoteData);
    await quoteRequest.save();

    // Send notification email (implement as needed)
    // await sendQuoteNotification(quoteRequest);

    res.status(201).json({
      success: true,
      message: 'Quote request submitted successfully. We will contact you soon!',
      data: { 
        quoteRequest: {
          id: quoteRequest._id,
          fullName: quoteRequest.fullName,
          projectType: quoteRequest.projectType,
          status: quoteRequest.status
        }
      }
    });

  } catch (error) {
    console.error('Create quote request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error submitting quote request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all quote requests with filtering (Admin only)
export const getQuoteRequests = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      projectType,
      budgetRange,
      priority,
      assignedTo,
      search,
      sort = '-createdAt'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (status) filter.status = status;
    if (projectType) filter.projectType = projectType;
    if (budgetRange) filter.budgetRange = budgetRange;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;

    // Text search
    if (search) {
      filter.$text = { $search: search };
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort,
      populate: [
        { path: 'assignedTo', select: 'name email phone image' },
        { path: 'notes.addedBy', select: 'username email' }
      ]
    };

    const quoteRequests = await QuoteRequest.paginate(filter, options);

    res.json({
      success: true,
      data: {
        quoteRequests: quoteRequests.docs,
        pagination: {
          currentPage: quoteRequests.page,
          totalPages: quoteRequests.totalPages,
          totalRequests: quoteRequests.totalDocs,
          hasNextPage: quoteRequests.hasNextPage,
          hasPrevPage: quoteRequests.hasPrevPage
        }
      }
    });

  } catch (error) {
    console.error('Get quote requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching quote requests',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get single quote request by ID (Admin only)
export const getQuoteRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const quoteRequest = await QuoteRequest.findById(id)
      .populate('assignedTo', 'name email phone whatsappNumber image specialization')
      .populate('notes.addedBy', 'username email');

    if (!quoteRequest) {
      return res.status(404).json({
        success: false,
        message: 'Quote request not found'
      });
    }

    res.json({
      success: true,
      data: { quoteRequest }
    });

  } catch (error) {
    console.error('Get quote request by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching quote request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update quote request (Admin only)
export const updateQuoteRequest = async (req, res) => {
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

    const existingQuote = await QuoteRequest.findById(id);
    if (!existingQuote) {
      return res.status(404).json({
        success: false,
        message: 'Quote request not found'
      });
    }

    // Verify agent exists if provided
    if (req.body.assignedTo) {
      const agent = await Agent.findById(req.body.assignedTo);
      if (!agent) {
        return res.status(400).json({
          success: false,
          message: 'Assigned agent not found'
        });
      }
    }

    const updateData = { ...req.body };

    // Handle new attachments
    if (req.files?.attachments) {
      const newAttachments = req.files.attachments.map(file => ({
        name: file.originalname,
        url: file.path
      }));
      updateData.attachments = [...(existingQuote.attachments || []), ...newAttachments];
    }

    const quoteRequest = await QuoteRequest.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    })
    .populate('assignedTo', 'name email phone whatsappNumber image')
    .populate('notes.addedBy', 'username email');

    res.json({
      success: true,
      message: 'Quote request updated successfully',
      data: { quoteRequest }
    });

  } catch (error) {
    console.error('Update quote request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating quote request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Add note to quote request (Admin only)
export const addNoteToQuote = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Note content is required'
      });
    }

    const quoteRequest = await QuoteRequest.findByIdAndUpdate(
      id,
      {
        $push: {
          notes: {
            content: content.trim(),
            addedBy: req.user._id
          }
        }
      },
      { new: true }
    )
    .populate('assignedTo', 'name email phone')
    .populate('notes.addedBy', 'username email');

    if (!quoteRequest) {
      return res.status(404).json({
        success: false,
        message: 'Quote request not found'
      });
    }

    res.json({
      success: true,
      message: 'Note added successfully',
      data: { quoteRequest }
    });

  } catch (error) {
    console.error('Add note to quote error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding note',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete quote request (Admin only)
export const deleteQuoteRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const quoteRequest = await QuoteRequest.findById(id);
    if (!quoteRequest) {
      return res.status(404).json({
        success: false,
        message: 'Quote request not found'
      });
    }

    // Delete associated attachments from Cloudinary
    if (quoteRequest.attachments?.length) {
      for (const attachment of quoteRequest.attachments) {
        const publicId = getPublicIdFromUrl(attachment.url);
        if (publicId) await deleteImage(publicId);
      }
    }

    await QuoteRequest.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Quote request deleted successfully'
    });

  } catch (error) {
    console.error('Delete quote request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting quote request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get quote request statistics (Admin only)
export const getQuoteStatistics = async (req, res) => {
  try {
    const totalRequests = await QuoteRequest.countDocuments();
    const newRequests = await QuoteRequest.countDocuments({ status: 'new' });
    const inProgressRequests = await QuoteRequest.countDocuments({ status: 'in-progress' });
    const completedRequests = await QuoteRequest.countDocuments({ status: 'completed' });

    // Get requests by project type
    const projectTypeStats = await QuoteRequest.aggregate([
      { $group: { _id: '$projectType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get requests by budget range
    const budgetRangeStats = await QuoteRequest.aggregate([
      { $group: { _id: '$budgetRange', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get recent requests
    const recentRequests = await QuoteRequest.find()
      .select('fullName projectType status createdAt')
      .sort('-createdAt')
      .limit(5);

    res.json({
      success: true,
      data: {
        overview: {
          total: totalRequests,
          new: newRequests,
          inProgress: inProgressRequests,
          completed: completedRequests
        },
        projectTypes: projectTypeStats,
        budgetRanges: budgetRangeStats,
        recentRequests
      }
    });

  } catch (error) {
    console.error('Get quote statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching quote statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};