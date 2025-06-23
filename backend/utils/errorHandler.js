// Error handling utility
export const handleAsyncError = (fn) => {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next)
    }
  }
  
  // Custom error class
  export class AppError extends Error {
    constructor(message, statusCode) {
      super(message)
      this.statusCode = statusCode
      this.isOperational = true
  
      Error.captureStackTrace(this, this.constructor)
    }
  }
  
  // Global error handler middleware
  export const globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500
    err.status = err.status || "error"
  
    console.error("Error:", {
      message: err.message,
      stack: err.stack,
      statusCode: err.statusCode,
    })
  
    // Mongoose validation error
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((val) => val.message)
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors,
      })
    }
  
    // Mongoose duplicate key error
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0]
      return res.status(400).json({
        success: false,
        message: `${field} already exists`,
      })
    }
  
    // JWT errors
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      })
    }
  
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      })
    }
  
    // Multer errors
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large",
      })
    }
  
    // Default error response
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    })
  }
  