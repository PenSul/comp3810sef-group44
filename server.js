/**
 * @fileoverview Main server entry point for HKMU CourseHub
 * @author COMP3810SEF Group 44
 */

require('dotenv').config();

const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const flash = require('connect-flash');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const connectDatabase = require('./config/database');
const configurePassport = require('./config/passport');
const routes = require('./routes');
const logger = require('./utils/logger');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const { setUser } = require('./middleware/auth');

// ========== APP INITIALIZATION ==========
const app = express();
const PORT = process.env.PORT || 8099;

// ========== DATABASE CONNECTION ==========
connectDatabase();

// ========== PASSPORT CONFIGURATION ==========
configurePassport();

// ========== VIEW ENGINE ==========
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ========== TRUST PROXY ==========
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// ========== MIDDLEWARE ==========
// Security
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
    },
  },
}));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
}

// Body parsing
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  },
  name: 'hkmu.sid',
  proxy: process.env.NODE_ENV === 'production',
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Flash messages
app.use(flash());

// Make flash messages available to views
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// Make user available to all views
app.use(setUser);

// ========== ROUTES ==========
app.use('/', routes);

// ========== ERROR HANDLING ==========
app.use(notFoundHandler);
app.use(errorHandler);

// ========== SERVER START ==========
app.listen(PORT, () => {
  logger.info(`HKMU CourseHub server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`URL: ${process.env.APP_URL || `http://localhost:${PORT}`}`);
});

// ========== GRACEFUL SHUTDOWN ==========
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

// ========== UNHANDLED ERRORS ==========
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});
