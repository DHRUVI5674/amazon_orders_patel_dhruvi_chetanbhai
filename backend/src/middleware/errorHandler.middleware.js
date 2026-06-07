/*
  errorHandler.middleware.js
  Global error handling middleware for Express.js applications.
  It ensures consistent API error responses across the project.
*/

import { ValidationError } from "../utils/customErrors.js"; // optional custom error class

/**
 * Express error handling middleware.
 *
 * @param {Error} err - The error object thrown in the application.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Next middleware function.
 */
const errorHandler = (err, req, res, next) => {
  // If response headers already sent, delegate to default Express handler
  if (res.headersSent) {
    return next(err);
  }

  // Default error structure
  const statusCode = err.status || 500;
  const message = err.message || "Internal Server Error";

  // Handle known validation errors (example using a custom ValidationError class)
  if (err instanceof ValidationError) {
    return res.status(err.status || 400).json({
      success: false,
      message: err.message,
      details: err.details || null,
    });
  }

  // For other errors, respond with a generic consistent payload
  res.status(statusCode).json({
    success: false,
    message,
    // In production you may want to hide stack traces.
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

export default errorHandler;
