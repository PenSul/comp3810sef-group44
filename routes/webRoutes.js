/**
 * @fileoverview Web page routes (CRUD UI)
 */

const express = require('express');
const courseController = require('../controllers/courseController');
const reviewController = require('../controllers/reviewController');
const materialController = require('../controllers/materialController');
const courseService = require('../services/courseService');
const { ensureAuthenticated, ensureAdmin } = require('../middleware/auth');
const { validateCourse, validateReview, validateMaterial } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// ===== HOME PAGE =====
router.get('/', asyncHandler(async (req, res) => {
  const topCourses = await courseService.getTopRatedCourses(6);

  res.render('pages/home', {
    title: 'HKMU CourseHub - Student Course Reviews',
    topCourses,
  });
}));

// ===== COURSE ROUTES =====
router.get('/courses', courseController.listCourses);
router.get('/courses/create', ensureAdmin, courseController.createCourseForm);
router.post('/courses/create', ensureAdmin, validateCourse, courseController.createCourse);
router.get('/courses/:courseCode', courseController.showCourse);
router.get('/courses/:courseCode/edit', ensureAdmin, courseController.editCourseForm);
router.post('/courses/:courseCode/edit', ensureAdmin, validateCourse, courseController.updateCourse);
router.post('/courses/:courseCode/delete', ensureAdmin, courseController.deleteCourse);

// ===== REVIEW ROUTES =====
router.get('/reviews/create', ensureAuthenticated, reviewController.createReviewForm);
router.post('/reviews/create', ensureAuthenticated, validateReview, reviewController.createReview);
router.get('/reviews/:reviewId/edit', ensureAuthenticated, reviewController.editReviewForm);
router.post('/reviews/:reviewId/edit', ensureAuthenticated, validateReview, reviewController.updateReview);
router.post('/reviews/:reviewId/delete', ensureAuthenticated, reviewController.deleteReview);
router.post('/reviews/:reviewId/helpful', ensureAuthenticated, reviewController.markHelpful);

// ===== MATERIAL ROUTES =====
router.get('/materials/upload', ensureAuthenticated, materialController.uploadMaterialForm);
router.post('/materials/upload',
  ensureAuthenticated,
  materialController.upload.single('file'),
  validateMaterial,
  materialController.uploadMaterial
);
router.get('/materials/:materialId/download', ensureAuthenticated, materialController.downloadMaterial);
router.post('/materials/:materialId/delete', ensureAuthenticated, materialController.deleteMaterial);

module.exports = router;
