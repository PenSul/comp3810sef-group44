/**
 * @fileoverview Authentication routes
 */

const express = require('express');
const passport = require('passport');
const authController = require('../controllers/authController');
const { redirectIfAuthenticated } = require('../middleware/auth');

const router = express.Router();

// Login page
router.get('/login', redirectIfAuthenticated, authController.getLogin);

// Google OAuth
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

// Google OAuth callback
router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/auth/login',
    failureFlash: true
  }),
  (req, res, next) => {
    // Explicitly save the session before redirecting
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        req.flash('error', 'Authentication error. Please try again.');
        return res.redirect('/auth/login');
      }
      
      console.log('Session saved successfully for user:', req.user?.email || 'unknown');
      next();
    });
  },
  authController.oauthCallback
);

// Logout
router.get('/logout', authController.logout);

module.exports = router;
