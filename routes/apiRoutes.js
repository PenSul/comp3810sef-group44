/**
 * @fileoverview RESTful API routes
 */

const express = require('express');
const apiController = require('../controllers/apiController');
const { ensureAuthenticated, ensureAdmin } = require('../middleware/auth');
const { validateApiReview, handleApiValidationErrors } = require('../middleware/validation');

const router = express.Router();

// ===== COURSE API =====
router.get('/courses', apiController.getCourses);
router.get('/courses/:courseCode', apiController.getCourse);
router.post('/courses', ensureAdmin, apiController.createCourse);
router.put('/courses/:courseCode', ensureAdmin, apiController.updateCourse);
router.delete('/courses/:courseCode', ensureAdmin, apiController.deleteCourse);

// ===== REVIEW API =====
router.get('/reviews', apiController.getReviews);
router.get('/reviews/:reviewId', apiController.getReview);
router.post('/reviews',
  ensureAuthenticated,
  validateApiReview,
  handleApiValidationErrors,
  apiController.createReview
);
router.put('/reviews/:reviewId', ensureAuthenticated, apiController.updateReview);
router.delete('/reviews/:reviewId', ensureAuthenticated, apiController.deleteReview);

// ===== MATERIAL API =====
router.get('/materials', apiController.getMaterials);

// ===== STATS API =====
router.get('/stats/top-courses', apiController.getTopCourses);
router.get('/stats/recent-reviews', apiController.getRecentReviews);

module.exports = router;
