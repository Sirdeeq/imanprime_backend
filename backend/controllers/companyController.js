import { validationResult } from 'express-validator';
import Company from '../models/Company.js';
import { deleteImage, getPublicIdFromUrl } from '../config/cloudinary.js';

// Get company information (Public)
export const getCompanyInfo = async (req, res) => {
  try {
    const company = await Company.findOne({ isActive: true })
      .populate('updatedBy', 'username email');

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company information not found'
      });
    }

    res.json({
      success: true,
      data: { company }
    });

  } catch (error) {
    console.error('Get company info error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching company information',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update company information (Admin only)
export const updateCompanyInfo = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const updateData = {
      ...req.body,
      updatedBy: req.user._id
    };

    // Handle logo upload
    if (req.files?.logo) {
      const existingCompany = await Company.findOne({ isActive: true });
      if (existingCompany?.logo) {
        const publicId = getPublicIdFromUrl(existingCompany.logo);
        if (publicId) await deleteImage(publicId);
      }
      updateData.logo = req.files.logo[0].path;
    }

    // Handle team member images
    if (req.files?.teamImages) {
      const teamImages = req.files.teamImages;
      if (updateData.team && Array.isArray(updateData.team)) {
        updateData.team.forEach((member, index) => {
          if (teamImages[index]) {
            member.image = teamImages[index].path;
          }
        });
      }
    }

    // Handle partner logos
    if (req.files?.partnerLogos) {
      const partnerLogos = req.files.partnerLogos;
      if (updateData.partners && Array.isArray(updateData.partners)) {
        updateData.partners.forEach((partner, index) => {
          if (partnerLogos[index]) {
            partner.logo = partnerLogos[index].path;
          }
        });
      }
    }

    const company = await Company.findOneAndUpdate(
      { isActive: true },
      updateData,
      { 
        new: true, 
        runValidators: true,
        upsert: true
      }
    ).populate('updatedBy', 'username email');

    res.json({
      success: true,
      message: 'Company information updated successfully',
      data: { company }
    });

  } catch (error) {
    console.error('Update company info error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating company information',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get company contacts (Public)
export const getCompanyContacts = async (req, res) => {
  try {
    const company = await Company.findOne({ isActive: true })
      .select('contacts socialMedia name');

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company contact information not found'
      });
    }

    res.json({
      success: true,
      data: { 
        contacts: company.contacts,
        socialMedia: company.socialMedia,
        companyName: company.name
      }
    });

  } catch (error) {
    console.error('Get company contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching company contacts',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get company team (Public)
export const getCompanyTeam = async (req, res) => {
  try {
    const company = await Company.findOne({ isActive: true })
      .select('team name');

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company team information not found'
      });
    }

    res.json({
      success: true,
      data: { 
        team: company.team,
        companyName: company.name
      }
    });

  } catch (error) {
    console.error('Get company team error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching company team',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get company partners (Public)
export const getCompanyPartners = async (req, res) => {
  try {
    const company = await Company.findOne({ isActive: true })
      .select('partners name');

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company partners information not found'
      });
    }

    res.json({
      success: true,
      data: { 
        partners: company.partners,
        companyName: company.name
      }
    });

  } catch (error) {
    console.error('Get company partners error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching company partners',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};