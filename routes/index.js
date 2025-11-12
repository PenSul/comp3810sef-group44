/**
 * @fileoverview Main router aggregator
 */

const express = require('express');
const authRoutes = require('./authRoutes');
const webRoutes = require('./webRoutes');
const apiRoutes = require('./apiRoutes');

const router = express.Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/api', apiRoutes);
router.use('/', webRoutes);

module.exports = router;
