/**
 * @fileoverview RESTful API controller
 */

const courseService = require('../services/courseService');
const reviewService = require('../services/reviewService');
const materialService = require('../services/materialService');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * GET /api/courses - Get all courses
 */
const getCourses = asyncHandler(async (req, res) => {
  const filters = {
    search: req.query.search,
    program: req.query.program,
    minRating: req.query.minRating,
    difficulty: req.query.difficulty,
    sort: req.query.sort,
  };

  const courses = await courseService.findCourses(filters);

  res.json({
    success: true,
    count: courses.length,
    data: courses,
  });
});

/**
 * GET /api/courses/:courseCode - Get course by code
 */
const getCourse = asyncHandler(async (req, res) => {
  const { courseCode } = req.params;
  const course = await courseService.findCourseByCode(courseCode);

  if (!course) {
    return res.status(404).json({
      success: false,
      error: 'Course not found',
    });
  }

  res.json({
    success: true,
    data: course,
  });
});

/**
 * POST /api/courses - Create new course (PUBLIC - NO AUTH)
 */
const createCourse = asyncHandler(async (req, res) => {
  const courseData = {
    courseCode: req.body.courseCode.toUpperCase(),
    courseName: req.body.courseName,
    program: req.body.program,
    credits: parseInt(req.body.credits),
    description: req.body.description,
    prerequisites: req.body.prerequisites || [],
    instructors: req.body.instructors || [],
  };

  const course = await courseService.createCourse(courseData);

  res.status(201).json({
    success: true,
    data: course,
  });
});

/**
 * PUT /api/courses/:courseCode - Update course (PUBLIC - NO AUTH)
 */
const updateCourse = asyncHandler(async (req, res) => {
  const { courseCode } = req.params;

  const updateData = {
    courseName: req.body.courseName,
    program: req.body.program,
    credits: parseInt(req.body.credits),
    description: req.body.description,
    prerequisites: req.body.prerequisites || [],
    instructors: req.body.instructors || [],
  };

  const course = await courseService.updateCourse(courseCode, updateData);

  if (!course) {
    return res.status(404).json({
      success: false,
      error: 'Course not found',
    });
  }

  res.json({
    success: true,
    data: course,
  });
});

/**
 * DELETE /api/courses/:courseCode - Delete course (PUBLIC - NO AUTH)
 */
const deleteCourse = asyncHandler(async (req, res) => {
  const { courseCode } = req.params;
  const deleted = await courseService.deleteCourse(courseCode);

  if (!deleted) {
    return res.status(404).json({
      success: false,
      error: 'Course not found',
    });
  }

  res.json({
    success: true,
    message: 'Course deleted successfully',
  });
});

/**
 * GET /api/reviews - Get reviews with filters
 */
const getReviews = asyncHandler(async (req, res) => {
  const filters = {
    courseCode: req.query.courseCode,
    userId: req.query.userId,
    semester: req.query.semester,
    year: req.query.year,
    minRating: req.query.minRating,
    sort: req.query.sort,
  };

  const reviews = await reviewService.findReviews(filters);

  res.json({
    success: true,
    count: reviews.length,
    data: reviews,
  });
});

/**
 * GET /api/reviews/:reviewId - Get single review
 */
const getReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const review = await reviewService.findReviewById(reviewId);

  if (!review) {
    return res.status(404).json({
      success: false,
      error: 'Review not found',
    });
  }

  res.json({
    success: true,
    data: review,
  });
});

/**
 * POST /api/reviews - Create new review (PUBLIC - NO AUTH)
 * Note: Since no authentication, userId must be provided in request body
 */
const createReview = asyncHandler(async (req, res) => {
  // Check if userId is provided in body (since no auth)
  if (!req.body.userId) {
    return res.status(400).json({
      success: false,
      error: 'userId is required in request body',
    });
  }

  const reviewData = {
    courseCode: req.body.courseCode.toUpperCase(),
    userId: req.body.userId, // From request body instead of req.user
    userName: req.body.userName || 'Anonymous',
    userPhoto: req.body.userPhoto || '',
    semester: req.body.semester,
    year: parseInt(req.body.year),
    instructor: req.body.instructor,
    rating: parseInt(req.body.rating),
    difficulty: parseInt(req.body.difficulty),
    workload: parseInt(req.body.workload),
    grade: req.body.grade || '',
    reviewText: req.body.reviewText,
    pros: req.body.pros || [],
    cons: req.body.cons || [],
    tips: req.body.tips || '',
  };

  const review = await reviewService.createReview(reviewData);

  res.status(201).json({
    success: true,
    data: review,
  });
});

/**
 * PUT /api/reviews/:reviewId - Update review (PUBLIC - NO AUTH)
 * Note: No ownership check since authentication is removed
 */
const updateReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const existingReview = await reviewService.findReviewById(reviewId);

  if (!existingReview) {
    return res.status(404).json({
      success: false,
      error: 'Review not found',
    });
  }

  // NO OWNERSHIP CHECK - Anyone can update any review

  const updateData = {
    semester: req.body.semester,
    year: parseInt(req.body.year),
    instructor: req.body.instructor,
    rating: parseInt(req.body.rating),
    difficulty: parseInt(req.body.difficulty),
    workload: parseInt(req.body.workload),
    grade: req.body.grade || '',
    reviewText: req.body.reviewText,
    pros: req.body.pros || [],
    cons: req.body.cons || [],
    tips: req.body.tips || '',
  };

  const review = await reviewService.updateReview(reviewId, updateData);

  res.json({
    success: true,
    data: review,
  });
});

/**
 * DELETE /api/reviews/:reviewId - Delete review (PUBLIC - NO AUTH)
 * Note: No ownership check since authentication is removed
 */
const deleteReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const review = await reviewService.findReviewById(reviewId);

  if (!review) {
    return res.status(404).json({
      success: false,
      error: 'Review not found',
    });
  }

  // NO OWNERSHIP CHECK - Anyone can delete any review

  await reviewService.deleteReview(reviewId);

  res.json({
    success: true,
    message: 'Review deleted successfully',
  });
});

/**
 * GET /api/materials - Get materials with filters
 */
const getMaterials = asyncHandler(async (req, res) => {
  const filters = {
    courseCode: req.query.courseCode,
    type: req.query.type,
    semester: req.query.semester,
    year: req.query.year,
  };

  const materials = await materialService.findMaterials(filters);

  res.json({
    success: true,
    count: materials.length,
    data: materials,
  });
});

/**
 * GET /api/stats/top-courses - Get top rated courses
 */
const getTopCourses = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const courses = await courseService.getTopRatedCourses(limit);

  res.json({
    success: true,
    count: courses.length,
    data: courses,
  });
});

/**
 * GET /api/stats/recent-reviews - Get recent reviews
 */
const getRecentReviews = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const reviews = await reviewService.getRecentReviews(limit);

  res.json({
    success: true,
    count: reviews.length,
    data: reviews,
  });
});

module.exports = {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  getMaterials,
  getTopCourses,
  getRecentReviews,
};
