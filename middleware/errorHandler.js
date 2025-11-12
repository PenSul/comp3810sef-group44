/**
 * @fileoverview Global error handling middleware
 */

const logger = require('../utils/logger');

/**
 * 404 Not Found handler
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const notFoundHandler = (req, res) => {
  res.status(404).render('errors/404', {
    title: 'Page Not Found',
    path: req.path,
  });
};

/**
 * Global error handler
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const errorHandler = (err, req, res, next) => {
  // Log error
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });

  // Set status code
  const statusCode = err.statusCode || 500;

  // Handle different error types
  if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
    // API error response
    return res.status(statusCode).json({
      success: false,
      error: {
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
      },
    });
  }

  // Web page error response
  res.status(statusCode).render('errors/500', {
    title: 'Server Error',
    message: process.env.NODE_ENV === 'development'
      ? err.message
      : 'Something went wrong. Please try again later.',
    error: process.env.NODE_ENV === 'development' ? err : {},
  });
};

/**
 * Async route handler wrapper
 * Catches errors in async functions and passes to error handler
 * @param {Function} fn - Async route handler function
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  notFoundHandler,
  errorHandler,
  asyncHandler,
};
