/**
 * @fileoverview RESTful API routes
 */

const express = require('express');
const apiController = require('../controllers/apiController');
const { validateApiReview, handleApiValidationErrors } = require('../middleware/validation');

const router = express.Router();

// ===== COURSE API (PUBLIC) =====
router.get('/courses', apiController.getCourses);
router.get('/courses/:courseCode', apiController.getCourse);
router.post('/courses', apiController.createCourse);
router.put('/courses/:courseCode', apiController.updateCourse);
router.delete('/courses/:courseCode', apiController.deleteCourse);

// ===== REVIEW API (PUBLIC) =====
router.get('/reviews', apiController.getReviews);
router.get('/reviews/:reviewId', apiController.getReview);
router.post('/reviews',
  validateApiReview,
  handleApiValidationErrors,
  apiController.createReview
);
router.put('/reviews/:reviewId', apiController.updateReview);
router.delete('/reviews/:reviewId', apiController.deleteReview);

// ===== MATERIAL API (PUBLIC) =====
router.get('/materials', apiController.getMaterials);

// ===== STATS API (PUBLIC) =====
router.get('/stats/top-courses', apiController.getTopCourses);
router.get('/stats/recent-reviews', apiController.getRecentReviews);

module.exports = router;
