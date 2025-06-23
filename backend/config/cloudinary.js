import cloudinary from "cloudinary"
import multer from "multer"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import "dotenv/config"

try {
  cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })

  console.log("Cloudinary initialized successfully")
} catch (error) {
  console.error("Failed to initialize Cloudinary:", error)
}

// Configure multer with Cloudinary storage for company logos
const companyStorage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: "company_images/logos",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "svg"],
    transformation: [{ width: 500, height: 500, crop: "limit", quality: "auto" }],
  },
})

// Configure multer with Cloudinary storage for team member images
const teamStorage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: "company_images/team",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 400, height: 400, crop: "fill", quality: "auto", gravity: "face" }],
  },
})

// Configure multer with Cloudinary storage for partner logos
const partnerStorage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: "company_images/partners",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "svg"],
    transformation: [{ width: 300, height: 200, crop: "fit", quality: "auto" }],
  },
})

// Create multer instances
const upload = multer({
  storage: companyStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true)
    } else {
      cb(new Error("Only image files are allowed"), false)
    }
  },
})

const teamUpload = multer({
  storage: teamStorage,
  limits: {
    fileSize: 3 * 1024 * 1024, // 3MB limit per file
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true)
    } else {
      cb(new Error("Only image files are allowed"), false)
    }
  },
})

const partnerUpload = multer({
  storage: partnerStorage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit per file
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true)
    } else {
      cb(new Error("Only image files are allowed"), false)
    }
  },
})

// Helper function to delete image from Cloudinary
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.v2.uploader.destroy(publicId)
    console.log("Image deleted from Cloudinary:", result)
    return result
  } catch (error) {
    console.error("Error deleting image from Cloudinary:", error)
    throw error
  }
}

// Helper function to extract public ID from Cloudinary URL
const getPublicIdFromUrl = (url) => {
  if (!url) return null
  const matches = url.match(/\/v\d+\/(.+)\./)
  return matches ? matches[1] : null
}

// Helper function to get URL from result
const getImageUrl = (result) => {
  if (!result?.secure_url) {
    console.error("Failed to get image URL:", result)
    return null
  }
  return result.secure_url
}

// Test Cloudinary connection
const testCloudinaryConnection = async () => {
  try {
    const testResult = await cloudinary.v2.uploader.upload(
      "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
      {
        public_id: "test_connection",
        overwrite: true,
        folder: "test",
      },
    )

    console.log("Cloudinary connection successful!")
    console.log("Test upload URL:", testResult.secure_url)

    // Clean up test image
    await deleteImage("test/test_connection")
    return true
  } catch (error) {
    console.error("Cloudinary connection failed!")
    console.error("Error details:", {
      message: error.message,
      code: error.code,
    })
    return false
  }
}

export {
  cloudinary,
  upload,
  teamUpload,
  partnerUpload,
  deleteImage,
  getPublicIdFromUrl,
  getImageUrl,
  testCloudinaryConnection,
}
