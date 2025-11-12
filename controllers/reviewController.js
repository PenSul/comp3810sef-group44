/**
 * @fileoverview Review controller
 */

const reviewService = require('../services/reviewService');
const courseService = require('../services/courseService');
const { asyncHandler } = require('../middleware/errorHandler');
const { SEMESTERS, GRADES } = require('../config/constants');

/**
 * Renders review creation form
 */
const createReviewForm = asyncHandler(async (req, res) => {
  const { courseCode } = req.query;

  let course = null;
  if (courseCode) {
    course = await courseService.findCourseByCode(courseCode);
  }

  res.render('pages/reviews/create', {
    title: 'Submit Review - HKMU CourseHub',
    course,
    semesters: SEMESTERS,
    grades: GRADES,
  });
});

/**
 * Handles review creation
 */
const createReview = asyncHandler(async (req, res) => {
  const reviewData = {
    courseCode: req.body.courseCode.toUpperCase(),
    userId: req.user._id,
    userName: req.user.name,
    userPhoto: req.user.photo,
    semester: req.body.semester,
    year: parseInt(req.body.year),
    instructor: req.body.instructor,
    rating: parseInt(req.body.rating),
    difficulty: parseInt(req.body.difficulty),
    workload: parseInt(req.body.workload),
    grade: req.body.grade || '',
    reviewText: req.body.reviewText,
    pros: req.body.pros ? req.body.pros.filter(p => p.trim()) : [],
    cons: req.body.cons ? req.body.cons.filter(c => c.trim()) : [],
    tips: req.body.tips || '',
  };

  await reviewService.createReview(reviewData);

  req.flash('success', 'Review submitted successfully');
  res.redirect(`/courses/${reviewData.courseCode}`);
});

/**
 * Renders review edit form
 */
const editReviewForm = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const review = await reviewService.findReviewById(reviewId);

  if (!review) {
    req.flash('error', 'Review not found');
    return res.redirect('/courses');
  }

  // Check if user owns this review
  if (review.userId._id.toString() !== req.user._id.toString()) {
    req.flash('error', 'You can only edit your own reviews');
    return res.redirect(`/courses/${review.courseCode}`);
  }

  res.render('pages/reviews/edit', {
    title: 'Edit Review - HKMU CourseHub',
    review,
    semesters: SEMESTERS,
    grades: GRADES,
  });
});

/**
 * Handles review update
 */
const updateReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const review = await reviewService.findReviewById(reviewId);

  if (!review) {
    req.flash('error', 'Review not found');
    return res.redirect('/courses');
  }

  // Check ownership
  if (review.userId._id.toString() !== req.user._id.toString()) {
    req.flash('error', 'You can only edit your own reviews');
    return res.redirect(`/courses/${review.courseCode}`);
  }

  const updateData = {
    semester: req.body.semester,
    year: parseInt(req.body.year),
    instructor: req.body.instructor,
    rating: parseInt(req.body.rating),
    difficulty: parseInt(req.body.difficulty),
    workload: parseInt(req.body.workload),
    grade: req.body.grade || '',
    reviewText: req.body.reviewText,
    pros: req.body.pros ? req.body.pros.filter(p => p.trim()) : [],
    cons: req.body.cons ? req.body.cons.filter(c => c.trim()) : [],
    tips: req.body.tips || '',
  };

  await reviewService.updateReview(reviewId, updateData);

  req.flash('success', 'Review updated successfully');
  res.redirect(`/courses/${review.courseCode}`);
});

/**
 * Handles review deletion
 */
const deleteReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const review = await reviewService.findReviewById(reviewId);

  if (!review) {
    req.flash('error', 'Review not found');
    return res.redirect('/courses');
  }

  // Check ownership or admin
  if (review.userId._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    req.flash('error', 'You can only delete your own reviews');
    return res.redirect(`/courses/${review.courseCode}`);
  }

  const courseCode = review.courseCode;
  await reviewService.deleteReview(reviewId);

  req.flash('success', 'Review deleted successfully');
  res.redirect(`/courses/${courseCode}`);
});

/**
 * Handles marking review as helpful
 */
const markHelpful = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  await reviewService.markReviewHelpful(reviewId);

  res.json({ success: true });
});

module.exports = {
  createReviewForm,
  createReview,
  editReviewForm,
  updateReview,
  deleteReview,
  markHelpful,
};
