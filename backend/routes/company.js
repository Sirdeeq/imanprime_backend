import express from "express"
import { body } from "express-validator"
import { adminAuth } from "../middleware/auth.js"
import { upload, teamUpload, partnerUpload } from "../config/cloudinary.js"
import {
  getCompanyInfo,
  updateCompanyInfo,
  getCompanyContacts,
  getCompanyTeam,
  getCompanyPartners,
  addTeamMember,
  updateTeamMember,
  deleteTeamMember,
  addPartner,
  updatePartner,
  deletePartner,
  updateCompanyBasicInfo,
} from "../controllers/companyController.js"

const router = express.Router()

// Validation middleware for team members
const validateTeamMember = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("position").trim().notEmpty().withMessage("Position is required"),
  body("phone").optional().trim(),
  body("socialLinks.linkedin").optional().isURL().withMessage("Invalid LinkedIn URL"),
  body("socialLinks.twitter").optional().isURL().withMessage("Invalid Twitter URL"),
  body("socialLinks.facebook").optional().isURL().withMessage("Invalid Facebook URL"),
  body("socialLinks.instagram").optional().isURL().withMessage("Invalid Instagram URL"),
]

// Validation middleware for partners
const validatePartner = [
  body("name").trim().notEmpty().withMessage("Partner name is required"),
  body("website").optional().isURL().withMessage("Invalid website URL"),
]

// Validation middleware for company basic info
const validateCompanyUpdate = [
  body("name").optional().trim().notEmpty().withMessage("Company name cannot be empty"),
  body("about.vision").optional().trim(),
  body("about.mission").optional().trim(),
  body("socialMedia.facebook").optional().isURL().withMessage("Invalid Facebook URL"),
  body("socialMedia.twitter").optional().isURL().withMessage("Invalid Twitter URL"),
  body("socialMedia.instagram").optional().isURL().withMessage("Invalid Instagram URL"),
  body("socialMedia.linkedin").optional().isURL().withMessage("Invalid LinkedIn URL"),
  body("socialMedia.youtube").optional().isURL().withMessage("Invalid YouTube URL"),
]

// File upload configurations
const companyLogoUpload = upload.single("logo")
const memberImageUpload = teamUpload.single("memberImage")
const partnerLogoUpload = partnerUpload.single("partnerLogo")

// Public routes
router.get("/", getCompanyInfo)
router.get("/contacts", getCompanyContacts)
router.get("/team", getCompanyTeam)
router.get("/partners", getCompanyPartners)

// Admin routes - Company basic info
router.put("/basic-info", adminAuth, companyLogoUpload, validateCompanyUpdate, updateCompanyBasicInfo)
router.put("/", adminAuth, validateCompanyUpdate, updateCompanyInfo)

// Admin routes - Team management
router.post("/team", adminAuth, memberImageUpload, validateTeamMember, addTeamMember)
router.put("/team/:id", adminAuth, memberImageUpload, validateTeamMember, updateTeamMember)
router.delete("/team/:id", adminAuth, deleteTeamMember)

// Admin routes - Partner management
router.post("/partners", adminAuth, partnerLogoUpload, validatePartner, addPartner)
router.put("/partners/:id", adminAuth, partnerLogoUpload, validatePartner, updatePartner)
router.delete("/partners/:id", adminAuth, deletePartner)

export default router
