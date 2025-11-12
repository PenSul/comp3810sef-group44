/**
 * @fileoverview Authentication middleware
 * Protects routes and checks user permissions
 */

const logger = require('../utils/logger');

/**
 * Ensures user is authenticated
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }

  req.flash('error', 'Please log in to access this page');
  res.redirect('/login');
};

/**
 * Ensures user is admin
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const ensureAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.isAdmin) {
    return next();
  }

  req.flash('error', 'Admin access required');
  res.redirect('/');
};

/**
 * Redirects authenticated users away from login page
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const redirectIfAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect('/courses');
  }
  next();
};

/**
 * Makes user available to all views
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const setUser = (req, res, next) => {
  res.locals.user = req.user || null;
  res.locals.isAuthenticated = req.isAuthenticated();
  next();
};

module.exports = {
  ensureAuthenticated,
  ensureAdmin,
  redirectIfAuthenticated,
  setUser,
};
