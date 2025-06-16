import { validationResult } from 'express-validator';
import Agent from '../models/Agent.js';
import Property from '../models/Property.js';
import { deleteImage, getPublicIdFromUrl } from '../config/cloudinary.js';

// Create new agent (Admin only)
export const createAgent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const agentData = {
      ...req.body,
      createdBy: req.user._id
    };

    // Handle image upload
    if (req.file) {
      agentData.image = req.file.path;
    }

    // Parse languages if they're sent as string
    if (typeof agentData.languages === 'string') {
      agentData.languages = agentData.languages.split(',').map(lang => lang.trim());
    }

    // Parse social media if sent as strings
    if (req.body.socialMedia) {
      agentData.socialMedia = req.body.socialMedia;
    }

    const agent = new Agent(agentData);
    await agent.save();

    const populatedAgent = await Agent.findById(agent._id)
      .populate('createdBy', 'username email');

    res.status(201).json({
      success: true,
      message: 'Agent created successfully',
      data: { agent: populatedAgent }
    });

  } catch (error) {
    console.error('Create agent error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating agent',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all agents with filtering and pagination
export const getAgents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      specialization,
      search,
      isActive,
      sort = 'name'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (specialization) filter.specialization = specialization;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

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

    const agents = await Agent.paginate(filter, options);

    // Get property count for each agent
    const agentsWithPropertyCount = await Promise.all(
      agents.docs.map(async (agent) => {
        const propertyCount = await Property.countDocuments({ 
          agent: agent._id,
          status: { $ne: 'deleted' }
        });
        return {
          ...agent.toObject(),
          propertyCount
        };
      })
    );

    res.json({
      success: true,
      data: {
        agents: agentsWithPropertyCount,
        pagination: {
          currentPage: agents.page,
          totalPages: agents.totalPages,
          totalAgents: agents.totalDocs,
          hasNextPage: agents.hasNextPage,
          hasPrevPage: agents.hasPrevPage
        }
      }
    });

  } catch (error) {
    console.error('Get agents error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching agents',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get single agent by ID
export const getAgentById = async (req, res) => {
  try {
    const { id } = req.params;

    const agent = await Agent.findById(id)
      .populate('createdBy', 'username email');

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    // Get agent's properties
    const properties = await Property.find({ 
      agent: id,
      status: 'active'
    })
    .select('title price location image bedrooms bathrooms category')
    .limit(10)
    .sort('-createdAt');

    // Get agent stats
    const totalProperties = await Property.countDocuments({ 
      agent: id,
      status: { $ne: 'deleted' }
    });

    const activeProperties = await Property.countDocuments({ 
      agent: id,
      status: 'active'
    });

    res.json({
      success: true,
      data: { 
        agent: {
          ...agent.toObject(),
          stats: {
            totalProperties,
            activeProperties
          }
        },
        properties 
      }
    });

  } catch (error) {
    console.error('Get agent by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching agent',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update agent (Admin only)
export const updateAgent = async (req, res) => {
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

    const existingAgent = await Agent.findById(id);
    if (!existingAgent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    const updateData = { ...req.body };

    // Handle image upload
    if (req.file) {
      // Delete old image
      if (existingAgent.image) {
        const publicId = getPublicIdFromUrl(existingAgent.image);
        if (publicId) await deleteImage(publicId);
      }
      updateData.image = req.file.path;
    }

    // Parse languages if they're sent as string
    if (typeof updateData.languages === 'string') {
      updateData.languages = updateData.languages.split(',').map(lang => lang.trim());
    }

    const agent = await Agent.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    }).populate('createdBy', 'username email');

    res.json({
      success: true,
      message: 'Agent updated successfully',
      data: { agent }
    });

  } catch (error) {
    console.error('Update agent error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating agent',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete agent (Admin only)
export const deleteAgent = async (req, res) => {
  try {
    const { id } = req.params;

    const agent = await Agent.findById(id);
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    // Check if agent has active properties
    const activeProperties = await Property.countDocuments({ 
      agent: id,
      status: 'active'
    });

    if (activeProperties > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete agent with active properties. Please reassign or delete the properties first.'
      });
    }

    // Delete associated image from Cloudinary
    if (agent.image) {
      const publicId = getPublicIdFromUrl(agent.image);
      if (publicId) await deleteImage(publicId);
    }

    await Agent.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Agent deleted successfully'
    });

  } catch (error) {
    console.error('Delete agent error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting agent',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get active agents for dropdown/selection
export const getActiveAgents = async (req, res) => {
  try {
    const agents = await Agent.find({ isActive: true })
      .select('name email phone specialization')
      .sort('name');

    res.json({
      success: true,
      data: { agents }
    });

  } catch (error) {
    console.error('Get active agents error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching active agents',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};