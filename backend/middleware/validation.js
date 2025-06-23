import { body, validationResult } from "express-validator"

// Company validation rules
export const validateCompanyUpdate = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Company name must be between 1 and 100 characters"),

  body("about.vision").optional().trim().isLength({ max: 1000 }).withMessage("Vision must not exceed 1000 characters"),

  body("about.mission")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Mission must not exceed 1000 characters"),

  body("socialMedia.facebook")
    .optional()
    .custom((value) => {
      if (value && !value.match(/^https?:\/\/(www\.)?facebook\.com\/.+/)) {
        throw new Error("Invalid Facebook URL")
      }
      return true
    }),

  body("socialMedia.twitter")
    .optional()
    .custom((value) => {
      if (value && !value.match(/^https?:\/\/(www\.)?(twitter\.com|x\.com)\/.+/)) {
        throw new Error("Invalid Twitter/X URL")
      }
      return true
    }),

  body("socialMedia.instagram")
    .optional()
    .custom((value) => {
      if (value && !value.match(/^https?:\/\/(www\.)?instagram\.com\/.+/)) {
        throw new Error("Invalid Instagram URL")
      }
      return true
    }),

  body("socialMedia.linkedin")
    .optional()
    .custom((value) => {
      if (value && !value.match(/^https?:\/\/(www\.)?linkedin\.com\/.+/)) {
        throw new Error("Invalid LinkedIn URL")
      }
      return true
    }),

  body("socialMedia.youtube")
    .optional()
    .custom((value) => {
      if (value && !value.match(/^https?:\/\/(www\.)?youtube\.com\/.+/)) {
        throw new Error("Invalid YouTube URL")
      }
      return true
    }),
]

// Team member validation rules
export const validateTeamMember = [
  body("name")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Name is required and must be between 1 and 100 characters"),

  body("position")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Position is required and must be between 1 and 100 characters"),

  body("phone")
    .optional()
    .trim()
    .matches(/^[+]?[1-9][\d]{0,15}$/)
    .withMessage("Invalid phone number format"),

  body("socialLinks.linkedin")
    .optional()
    .custom((value) => {
      if (value && !value.match(/^https?:\/\/(www\.)?linkedin\.com\/.+/)) {
        throw new Error("Invalid LinkedIn URL")
      }
      return true
    }),

  body("socialLinks.twitter")
    .optional()
    .custom((value) => {
      if (value && !value.match(/^https?:\/\/(www\.)?(twitter\.com|x\.com)\/.+/)) {
        throw new Error("Invalid Twitter/X URL")
      }
      return true
    }),

  body("socialLinks.facebook")
    .optional()
    .custom((value) => {
      if (value && !value.match(/^https?:\/\/(www\.)?facebook\.com\/.+/)) {
        throw new Error("Invalid Facebook URL")
      }
      return true
    }),

  body("socialLinks.instagram")
    .optional()
    .custom((value) => {
      if (value && !value.match(/^https?:\/\/(www\.)?instagram\.com\/.+/)) {
        throw new Error("Invalid Instagram URL")
      }
      return true
    }),
]

// Validation result handler
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    })
  }
  next()
}
