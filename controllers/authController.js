/**
 * @fileoverview Authentication controller
 */

const logger = require('../utils/logger');

/**
 * Renders login page
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getLogin = (req, res) => {
  res.render('pages/login', {
    title: 'Login - HKMU CourseHub',
  });
};

/**
 * Handles logout
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const logout = (req, res) => {
  const userEmail = req.user?.email || 'Unknown user';

  req.logout((err) => {
    if (err) {
      logger.error(`Logout error: ${err.message}`);
      return res.redirect('/');
    }

    logger.info(`User logged out: ${userEmail}`);

    // Destroy the session properly
    req.session.destroy((err) => {
      if (err) {
        logger.error(`Session destruction error: ${err.message}`);
      }
      res.clearCookie('connect.sid'); // Clear the session cookie
      res.redirect('/');
    });
  });
};

/**
 * Handles successful OAuth callback
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const oauthCallback = (req, res) => {
  req.flash('success', `Welcome back, ${req.user.name}!`);
  res.redirect('/courses');
};

module.exports = {
  getLogin,
  logout,
  oauthCallback,
};
