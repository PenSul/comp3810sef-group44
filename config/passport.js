/**
 * @fileoverview Passport.js Google OAuth 2.0 strategy configuration
 */

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Configure Passport with Google OAuth strategy
 */
const configurePassport = () => {
  // Serialize user for session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      logger.error(`Error deserializing user: ${error.message}`);
      done(error, null);
    }
  });

  // Google OAuth strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            // Update last login
            user.lastLogin = new Date();
            await user.save();
            logger.info(`Existing user logged in: ${user.email}`);
            return done(null, user);
          }

          // Create new user
          user = await User.create({
            googleId: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
            photo: profile.photos[0]?.value || '',
            isAdmin: false,
            lastLogin: new Date(),
          });

          logger.info(`New user created: ${user.email}`);
          done(null, user);
        } catch (error) {
          logger.error(`Google OAuth error: ${error.message}`);
          done(error, null);
        }
      }
    )
  );
};

module.exports = configurePassport;
