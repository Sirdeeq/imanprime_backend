import multer from "multer"

// Enhanced error handling middleware
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message:
          "File too large. Maximum size allowed is 5MB for company logos, 3MB for team images, and 2MB for partner logos.",
      })
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message: "Unexpected file field. Please check the field name.",
      })
    }
  }

  if (err.message === "Only image files are allowed") {
    return res.status(400).json({
      success: false,
      message: "Only image files (JPG, JPEG, PNG, WEBP, SVG) are allowed.",
    })
  }

  next(err)
}

// Global error handler
export const globalErrorHandler = (err, req, res, next) => {
  console.error("Global error:", {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  })

  // Default error response
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  })
}
