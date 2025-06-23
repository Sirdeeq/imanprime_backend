import { validationResult } from 'express-validator';
import Property from '../models/Property.js';
import Agent from '../models/Agent.js';
import { deleteImage, getPublicIdFromUrl, getImageUrl, cloudinary } from '../config/cloudinary.js';

// Create new property (Admin only)
export const createProperty = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Verify agent exists
    const agent = await Agent.findById(req.body.agent);
    if (!agent) {
      return res.status(400).json({
        success: false,
        message: 'Agent not found'
      });
    }

    const propertyData = {
      ...req.body,
      createdBy: req.user._id
    };

    // Handle file uploads if present
    if (req.files) {
      if (req.files.image) {
        const imageResult = await cloudinary.v2.uploader.upload(req.files.image[0].path);
        propertyData.image = getImageUrl(imageResult);
      }
      
      if (req.files.images) {
        const imageResults = await Promise.all(
          req.files.images.map(file => cloudinary.v2.uploader.upload(file.path))
        );
        propertyData.images = imageResults.map(result => getImageUrl(result));
      }
      
      if (req.files.floor_plans) {
        const floorPlanResults = await Promise.all(
          req.files.floor_plans.map(file => cloudinary.v2.uploader.upload(file.path))
        );
        propertyData.floor_plans = floorPlanResults.map((result, index) => ({
          name: req.body.floor_plan_names?.[index] || `Floor Plan ${index + 1}`,
          image: getImageUrl(result)
        }));
      }
    }

    const property = new Property(propertyData);
    await property.save();

    const populatedProperty = await Property.findById(property._id)
      .populate('agent', 'name email phone image')
      .populate('createdBy', 'username email');

    res.status(201).json({
      success: true,
      message: 'Property created successfully',
      data: { property: populatedProperty }
    });

  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating property',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all properties with filtering and pagination
export const getProperties = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      location,
      search,
      featured,
      sort = '-createdAt'
    } = req.query;

    // Build filter object
    const filter = {};
    
    // Only show non-deleted properties to public
    if (req.user?.role !== 'admin') {
      filter.status = 'active';
    } else if (status) {
      filter.status = status;
    }

    if (category) filter.category = category;
    if (bedrooms) filter.bedrooms = parseInt(bedrooms);
    if (bathrooms) filter.bathrooms = parseInt(bathrooms);
    if (location) filter.location = new RegExp(location, 'i');
    if (featured !== undefined) filter.featured = featured === 'true';

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
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
        { path: 'agent', select: 'name email phone image' },
        { path: 'createdBy', select: 'username email' }
      ]
    };

    const properties = await Property.paginate(filter, options);

    res.json({
      success: true,
      data: {
        properties: properties.docs,
        pagination: {
          currentPage: properties.page,
          totalPages: properties.totalPages,
          totalProperties: properties.totalDocs,
          hasNextPage: properties.hasNextPage,
          hasPrevPage: properties.hasPrevPage
        }
      }
    });

  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching properties',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get single property by ID
export const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;

    const property = await Property.findById(id)
      .populate('agent', 'name email phone image bio specialization experience')
      .populate('createdBy', 'username email');

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Check if user can view this property
    if (property.status !== 'active' && req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Property not available'
      });
    }

    // Increment views count
    await Property.findByIdAndUpdate(id, { $inc: { views: 1 } });

    res.json({
      success: true,
      data: { property }
    });

  } catch (error) {
    console.error('Get property by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching property',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get properties for landing page
export const getLandingProperties = async (req, res) => {
  try {
    // Get featured properties
    const featuredProperties = await Property.find({
      status: 'active',
      featured: true
    })
    .populate('agent', 'name phone')
    .limit(6)
    .sort('-createdAt');

    // Get latest properties
    const latestProperties = await Property.find({
      status: 'active'
    })
    .populate('agent', 'name phone')
    .limit(8)
    .sort('-createdAt');

    // Get properties by category
    const categories = ['residential', 'commercial', 'luxury'];
    const propertiesByCategory = {};

    for (const category of categories) {
      propertiesByCategory[category] = await Property.find({
        status: 'active',
        category
      })
      .populate('agent', 'name phone')
      .limit(4)
      .sort('-createdAt');
    }

    res.json({
      success: true,
      data: {
        featured: featuredProperties,
        latest: latestProperties,
        byCategory: propertiesByCategory
      }
    });

  } catch (error) {
    console.error('Get landing properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching landing properties',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update property (Admin only)
export const updateProperty = async (req, res) => {
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

    const existingProperty = await Property.findById(id);
    if (!existingProperty) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Verify agent exists if provided
    if (req.body.agent) {
      const agent = await Agent.findById(req.body.agent);
      if (!agent) {
        return res.status(400).json({
          success: false,
          message: 'Agent not found'
        });
      }
    }

    const updateData = { ...req.body };

    // Handle file uploads if present
    if (req.files) {
      if (req.files.image) {
        // Delete old image
        if (existingProperty.image) {
          const publicId = getPublicIdFromUrl(existingProperty.image);
          if (publicId) await deleteImage(publicId);
        }
        const imageResult = await cloudinary.uploader.upload(req.files.image[0].path);
        updateData.image = getImageUrl(imageResult);
      }
      
      if (req.files.images) {
        // Delete old images
        if (existingProperty.images?.length) {
          for (const imageUrl of existingProperty.images) {
            const publicId = getPublicIdFromUrl(imageUrl);
            if (publicId) await deleteImage(publicId);
          }
        }
        const imageResults = await Promise.all(
          req.files.images.map(file => cloudinary.uploader.upload(file.path))
        );
        updateData.images = imageResults.map(result => getImageUrl(result));
      }
      
      if (req.files.floor_plans) {
        // Delete old floor plans
        if (existingProperty.floor_plans?.length) {
          for (const plan of existingProperty.floor_plans) {
            const publicId = getPublicIdFromUrl(plan.image);
            if (publicId) await deleteImage(publicId);
          }
        }
        const floorPlanResults = await Promise.all(
          req.files.floor_plans.map(file => cloudinary.uploader.upload(file.path))
        );
        updateData.floor_plans = floorPlanResults.map((result, index) => ({
          name: req.body.floor_plan_names?.[index] || `Floor Plan ${index + 1}`,
          image: getImageUrl(result)
        }));
      }
    }

    const property = await Property.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    })
    .populate('agent', 'name email phone image')
    .populate('createdBy', 'username email');

    res.json({
      success: true,
      message: 'Property updated successfully',
      data: { property }
    });

  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating property',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete property (Admin only)
export const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;

    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Delete associated images from Cloudinary
    const imagesToDelete = [property.image, ...property.images];
    if (property.floor_plans?.length) {
      imagesToDelete.push(...property.floor_plans.map(plan => plan.image));
    }

    for (const imageUrl of imagesToDelete) {
      if (imageUrl) {
        const publicId = getPublicIdFromUrl(imageUrl);
        if (publicId) await deleteImage(publicId);
      }
    }

    await Property.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Property deleted successfully'
    });

  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting property',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};