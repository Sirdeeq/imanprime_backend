import { validationResult } from "express-validator"
import Company from "../models/Company.js"
import { deleteImage, getPublicIdFromUrl } from "../config/cloudinary.js"

// Helper function to safely parse JSON
const safeJsonParse = (str, fallback = null) => {
  try {
    return typeof str === "string" ? JSON.parse(str) : str
  } catch (error) {
    console.error("JSON parse error:", error)
    return fallback
  }
}

// Helper function to ensure company exists
const ensureCompanyExists = async (userId) => {
  let company = await Company.findOne({ isActive: true })

  if (!company) {
    company = new Company({
      name: "ImanPrime",
      updatedBy: userId,
    })
    await company.save()
  }

  return company
}

// Get company information (Public)
export const getCompanyInfo = async (req, res) => {
  try {
    console.log("Getting company information")

    const company = await Company.findOne({ isActive: true }).populate("updatedBy", "username email")

    if (!company) {
      console.log("Company not found in database")
      return res.status(404).json({
        success: false,
        message: "Company information not found",
      })
    }

    console.log("Company found:", {
      id: company._id,
      name: company.name,
      logo: company.logo,
      teamCount: company.team?.length || 0,
      partnerCount: company.partners?.length || 0,
    })

    // Ensure all image URLs are included
    const companyData = {
      ...company.toObject(),
      logo: company.logo || "",
      team: (company.team || []).map((member) => ({
        ...member.toObject(),
        image: member.image || "",
      })),
      partners: (company.partners || []).map((partner) => ({
        ...partner.toObject(),
        logo: partner.logo || "",
      })),
    }

    res.json({
      success: true,
      data: { company: companyData },
    })
  } catch (error) {
    console.error("Get company info error:", error)
    res.status(500).json({
      success: false,
      message: "Server error fetching company information",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// Update company basic information (Admin only)
export const updateCompanyBasicInfo = async (req, res) => {
  try {
    console.log("Update company basic info request received")
    console.log("Request body:", req.body)
    console.log("Request file:", req.file)

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const company = await ensureCompanyExists(req.user._id)

    // Handle basic field updates
    if (req.body.name !== undefined) {
      company.name = req.body.name
    }

    // Handle about section updates
    if (req.body.about) {
      const aboutData = typeof req.body.about === "string" ? safeJsonParse(req.body.about, {}) : req.body.about

      if (aboutData.vision !== undefined) {
        company.about.vision = aboutData.vision
      }
      if (aboutData.mission !== undefined) {
        company.about.mission = aboutData.mission
      }
      if (aboutData.story && Array.isArray(aboutData.story)) {
        company.about.story = aboutData.story
      }
      if (aboutData.values && Array.isArray(aboutData.values)) {
        company.about.values = aboutData.values
      }
    }

    // Handle social media updates
    if (req.body.socialMedia) {
      const socialData =
        typeof req.body.socialMedia === "string" ? safeJsonParse(req.body.socialMedia, {}) : req.body.socialMedia
      company.socialMedia = { ...company.socialMedia.toObject(), ...socialData }
    }

    // Handle contacts updates
    if (req.body.contacts) {
      const contactsData =
        typeof req.body.contacts === "string" ? safeJsonParse(req.body.contacts, {}) : req.body.contacts
      company.contacts = { ...company.contacts.toObject(), ...contactsData }
    }

    // Handle logo upload
    if (req.file) {
      console.log("Logo file received:", req.file)

      // Delete old logo if exists
      if (company.logo) {
        const publicId = getPublicIdFromUrl(company.logo)
        if (publicId) {
          try {
            await deleteImage(publicId)
            console.log("Deleted old logo:", publicId)
          } catch (error) {
            console.error("Error deleting old logo:", error)
          }
        }
      }

      company.logo = req.file.path
      console.log("New logo uploaded:", company.logo)
    }

    company.updatedBy = req.user._id
    const savedCompany = await company.save()
    await savedCompany.populate("updatedBy", "username email")

    console.log("Company basic info updated successfully")

    res.json({
      success: true,
      message: "Company basic information updated successfully",
      data: { company: savedCompany },
    })
  } catch (error) {
    console.error("Update company basic info error:", error)
    res.status(500).json({
      success: false,
      message: "Server error updating company basic information",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// Update company information (Admin only) - Legacy endpoint for bulk updates
export const updateCompanyInfo = async (req, res) => {
  try {
    console.log("Update company request received")
    console.log("Request body:", req.body)

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const company = await ensureCompanyExists(req.user._id)

    // Handle basic field updates
    const fieldsToUpdate = ["name", "socialMedia", "contacts"]
    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (typeof req.body[field] === "string") {
          company[field] = safeJsonParse(req.body[field], company[field])
        } else {
          company[field] = req.body[field]
        }
      }
    })

    // Handle about section updates
    if (req.body.about) {
      const aboutData = typeof req.body.about === "string" ? safeJsonParse(req.body.about, {}) : req.body.about
      company.about = { ...company.about.toObject(), ...aboutData }
    }

    company.updatedBy = req.user._id
    const savedCompany = await company.save()
    await savedCompany.populate("updatedBy", "username email")

    res.json({
      success: true,
      message: "Company information updated successfully",
      data: { company: savedCompany },
    })
  } catch (error) {
    console.error("Update company info error:", error)
    res.status(500).json({
      success: false,
      message: "Server error updating company information",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// Get company contacts (Public)
export const getCompanyContacts = async (req, res) => {
  try {
    const company = await Company.findOne({ isActive: true }).select("contacts socialMedia name")

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company contact information not found",
      })
    }

    res.json({
      success: true,
      data: {
        contacts: company.contacts,
        socialMedia: company.socialMedia,
        companyName: company.name,
      },
    })
  } catch (error) {
    console.error("Get company contacts error:", error)
    res.status(500).json({
      success: false,
      message: "Server error fetching company contacts",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// Get company team (Public)
export const getCompanyTeam = async (req, res) => {
  try {
    const company = await Company.findOne({ isActive: true }).select("team name")

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company team information not found",
      })
    }

    res.json({
      success: true,
      data: {
        team: company.team || [],
        companyName: company.name,
      },
    })
  } catch (error) {
    console.error("Get company team error:", error)
    res.status(500).json({
      success: false,
      message: "Server error fetching company team",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// Get company partners (Public)
export const getCompanyPartners = async (req, res) => {
  try {
    const company = await Company.findOne({ isActive: true }).select("partners name")

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company partners information not found",
      })
    }

    res.json({
      success: true,
      data: {
        partners: company.partners || [],
        companyName: company.name,
      },
    })
  } catch (error) {
    console.error("Get company partners error:", error)
    res.status(500).json({
      success: false,
      message: "Server error fetching company partners",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// Add new team member (Admin only)
export const addTeamMember = async (req, res) => {
  try {
    console.log("Add team member request received")
    console.log("Request body:", req.body)
    console.log("Request file:", req.file)

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const company = await ensureCompanyExists(req.user._id)

    const newMember = {
      name: req.body.name,
      position: req.body.position,
      phone: req.body.phone || "",
      socialLinks: {
        linkedin: req.body["socialLinks.linkedin"] || req.body.socialLinks?.linkedin || "",
        twitter: req.body["socialLinks.twitter"] || req.body.socialLinks?.twitter || "",
        facebook: req.body["socialLinks.facebook"] || req.body.socialLinks?.facebook || "",
        instagram: req.body["socialLinks.instagram"] || req.body.socialLinks?.instagram || "",
      },
      image: "",
    }

    // Handle image upload
    if (req.file) {
      newMember.image = req.file.path
      console.log("Team member image uploaded:", req.file.path)
    }

    company.team.push(newMember)
    company.updatedBy = req.user._id
    await company.save()

    // Get the newly added member with its ID
    const addedMember = company.team[company.team.length - 1]

    res.json({
      success: true,
      message: "Team member added successfully",
      data: { member: addedMember },
    })
  } catch (error) {
    console.error("Add team member error:", error)
    res.status(500).json({
      success: false,
      message: "Server error adding team member",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// Update team member (Admin only)
export const updateTeamMember = async (req, res) => {
  try {
    console.log("Update team member request received")
    console.log("Request params:", req.params)
    console.log("Request body:", req.body)
    console.log("Request file:", req.file)

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const company = await Company.findOne({ isActive: true })
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      })
    }

    const memberIndex = company.team.findIndex((member) => member._id.toString() === req.params.id)
    if (memberIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Team member not found",
      })
    }

    const existingMember = company.team[memberIndex]

    // Update member data
    const updateData = {
      name: req.body.name || existingMember.name,
      position: req.body.position || existingMember.position,
      phone: req.body.phone !== undefined ? req.body.phone : existingMember.phone,
      socialLinks: {
        linkedin:
          req.body["socialLinks.linkedin"] ||
          req.body.socialLinks?.linkedin ||
          existingMember.socialLinks?.linkedin ||
          "",
        twitter:
          req.body["socialLinks.twitter"] || req.body.socialLinks?.twitter || existingMember.socialLinks?.twitter || "",
        facebook:
          req.body["socialLinks.facebook"] ||
          req.body.socialLinks?.facebook ||
          existingMember.socialLinks?.facebook ||
          "",
        instagram:
          req.body["socialLinks.instagram"] ||
          req.body.socialLinks?.instagram ||
          existingMember.socialLinks?.instagram ||
          "",
      },
      image: existingMember.image,
    }

    // Handle image upload
    if (req.file) {
      // Delete old image if exists
      if (existingMember.image) {
        const publicId = getPublicIdFromUrl(existingMember.image)
        if (publicId) {
          try {
            await deleteImage(publicId)
            console.log("Deleted old team member image:", publicId)
          } catch (error) {
            console.error("Error deleting old team member image:", error)
          }
        }
      }

      updateData.image = req.file.path
      console.log("New team member image uploaded:", req.file.path)
    }

    // Update the member
    company.team[memberIndex] = { ...existingMember.toObject(), ...updateData }
    company.updatedBy = req.user._id
    await company.save()

    res.json({
      success: true,
      message: "Team member updated successfully",
      data: { member: company.team[memberIndex] },
    })
  } catch (error) {
    console.error("Update team member error:", error)
    res.status(500).json({
      success: false,
      message: "Server error updating team member",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// Delete team member (Admin only)
export const deleteTeamMember = async (req, res) => {
  try {
    console.log("Delete team member request received")
    console.log("Request params:", req.params)

    const company = await Company.findOne({ isActive: true })
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      })
    }

    const memberIndex = company.team.findIndex((member) => member._id.toString() === req.params.id)
    if (memberIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Team member not found",
      })
    }

    const memberToDelete = company.team[memberIndex]

    // Delete image from Cloudinary if exists
    if (memberToDelete.image) {
      const publicId = getPublicIdFromUrl(memberToDelete.image)
      if (publicId) {
        try {
          await deleteImage(publicId)
          console.log("Deleted team member image:", publicId)
        } catch (error) {
          console.error("Error deleting team member image:", error)
        }
      }
    }

    company.team.splice(memberIndex, 1)
    company.updatedBy = req.user._id
    await company.save()

    res.json({
      success: true,
      message: "Team member deleted successfully",
    })
  } catch (error) {
    console.error("Delete team member error:", error)
    res.status(500).json({
      success: false,
      message: "Server error deleting team member",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// Add new partner (Admin only)
export const addPartner = async (req, res) => {
  try {
    console.log("Add partner request received")
    console.log("Request body:", req.body)
    console.log("Request file:", req.file)

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const company = await ensureCompanyExists(req.user._id)

    const newPartner = {
      name: req.body.name,
      website: req.body.website || "",
      logo: "",
    }

    // Handle logo upload
    if (req.file) {
      newPartner.logo = req.file.path
      console.log("Partner logo uploaded:", req.file.path)
    }

    company.partners.push(newPartner)
    company.updatedBy = req.user._id
    await company.save()

    // Get the newly added partner with its ID
    const addedPartner = company.partners[company.partners.length - 1]

    res.json({
      success: true,
      message: "Partner added successfully",
      data: { partner: addedPartner },
    })
  } catch (error) {
    console.error("Add partner error:", error)
    res.status(500).json({
      success: false,
      message: "Server error adding partner",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// Update partner (Admin only)
export const updatePartner = async (req, res) => {
  try {
    console.log("Update partner request received")
    console.log("Request params:", req.params)
    console.log("Request body:", req.body)
    console.log("Request file:", req.file)

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const company = await Company.findOne({ isActive: true })
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      })
    }

    const partnerIndex = company.partners.findIndex((partner) => partner._id.toString() === req.params.id)
    if (partnerIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Partner not found",
      })
    }

    const existingPartner = company.partners[partnerIndex]

    // Update partner data
    const updateData = {
      name: req.body.name || existingPartner.name,
      website: req.body.website !== undefined ? req.body.website : existingPartner.website,
      logo: existingPartner.logo,
    }

    // Handle logo upload
    if (req.file) {
      // Delete old logo if exists
      if (existingPartner.logo) {
        const publicId = getPublicIdFromUrl(existingPartner.logo)
        if (publicId) {
          try {
            await deleteImage(publicId)
            console.log("Deleted old partner logo:", publicId)
          } catch (error) {
            console.error("Error deleting old partner logo:", error)
          }
        }
      }

      updateData.logo = req.file.path
      console.log("New partner logo uploaded:", req.file.path)
    }

    // Update the partner
    company.partners[partnerIndex] = { ...existingPartner.toObject(), ...updateData }
    company.updatedBy = req.user._id
    await company.save()

    res.json({
      success: true,
      message: "Partner updated successfully",
      data: { partner: company.partners[partnerIndex] },
    })
  } catch (error) {
    console.error("Update partner error:", error)
    res.status(500).json({
      success: false,
      message: "Server error updating partner",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// Delete partner (Admin only)
export const deletePartner = async (req, res) => {
  try {
    console.log("Delete partner request received")
    console.log("Request params:", req.params)

    const company = await Company.findOne({ isActive: true })
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      })
    }

    const partnerIndex = company.partners.findIndex((partner) => partner._id.toString() === req.params.id)
    if (partnerIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Partner not found",
      })
    }

    const partnerToDelete = company.partners[partnerIndex]

    // Delete logo from Cloudinary if exists
    if (partnerToDelete.logo) {
      const publicId = getPublicIdFromUrl(partnerToDelete.logo)
      if (publicId) {
        try {
          await deleteImage(publicId)
          console.log("Deleted partner logo:", publicId)
        } catch (error) {
          console.error("Error deleting partner logo:", error)
        }
      }
    }

    company.partners.splice(partnerIndex, 1)
    company.updatedBy = req.user._id
    await company.save()

    res.json({
      success: true,
      message: "Partner deleted successfully",
    })
  } catch (error) {
    console.error("Delete partner error:", error)
    res.status(500).json({
      success: false,
      message: "Server error deleting partner",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}
