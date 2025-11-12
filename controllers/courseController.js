/**
 * @fileoverview Course controller
 */

const courseService = require('../services/courseService');
const reviewService = require('../services/reviewService');
const materialService = require('../services/materialService');
const { asyncHandler } = require('../middleware/errorHandler');
const { PROGRAMS, SEMESTERS } = require('../config/constants');

/**
 * Renders course listing page
 */
const listCourses = asyncHandler(async (req, res) => {
  const filters = {
    search: req.query.search,
    program: req.query.program,
    minRating: req.query.minRating,
    difficulty: req.query.difficulty,
    instructor: req.query.instructor,
    sort: req.query.sort,
  };

  const courses = await courseService.findCourses(filters);

  res.render('pages/courses/list', {
    title: 'Browse Courses - HKMU CourseHub',
    courses,
    filters,
    programs: PROGRAMS,
  });
});

/**
 * Renders course detail page
 */
const showCourse = asyncHandler(async (req, res) => {
  const { courseCode } = req.params;

  const course = await courseService.findCourseByCode(courseCode);

  if (!course) {
    req.flash('error', 'Course not found');
    return res.redirect('/courses');
  }

  const reviews = await reviewService.findReviews({ courseCode });
  const materials = await materialService.getMaterialsByCourse(courseCode);

  res.render('pages/courses/detail', {
    title: `${course.courseCode} - ${course.courseName}`,
    course,
    reviews,
    materials,
  });
});

/**
 * Renders course creation form (admin only)
 */
const createCourseForm = (req, res) => {
  res.render('pages/courses/create', {
    title: 'Add New Course - HKMU CourseHub',
    programs: PROGRAMS,
  });
};

/**
 * Handles course creation
 */
const createCourse = asyncHandler(async (req, res) => {
  const courseData = {
    courseCode: req.body.courseCode.toUpperCase(),
    courseName: req.body.courseName,
    program: req.body.program,
    credits: parseInt(req.body.credits),
    description: req.body.description,
    prerequisites: req.body.prerequisites
      ? req.body.prerequisites.split(',').map(p => p.trim())
      : [],
    instructors: req.body.instructors
      ? req.body.instructors.split(',').map(i => i.trim())
      : [],
  };

  await courseService.createCourse(courseData);

  req.flash('success', 'Course created successfully');
  res.redirect(`/courses/${courseData.courseCode}`);
});

/**
 * Renders course edit form (admin only)
 */
const editCourseForm = asyncHandler(async (req, res) => {
  const { courseCode } = req.params;
  const course = await courseService.findCourseByCode(courseCode);

  if (!course) {
    req.flash('error', 'Course not found');
    return res.redirect('/courses');
  }

  res.render('pages/courses/edit', {
    title: `Edit ${course.courseCode}`,
    course,
    programs: PROGRAMS,
  });
});

/**
 * Handles course update
 */
const updateCourse = asyncHandler(async (req, res) => {
  const { courseCode } = req.params;

  const updateData = {
    courseName: req.body.courseName,
    program: req.body.program,
    credits: parseInt(req.body.credits),
    description: req.body.description,
    prerequisites: req.body.prerequisites
      ? req.body.prerequisites.split(',').map(p => p.trim())
      : [],
    instructors: req.body.instructors
      ? req.body.instructors.split(',').map(i => i.trim())
      : [],
  };

  await courseService.updateCourse(courseCode, updateData);

  req.flash('success', 'Course updated successfully');
  res.redirect(`/courses/${courseCode}`);
});

/**
 * Handles course deletion
 */
const deleteCourse = asyncHandler(async (req, res) => {
  const { courseCode } = req.params;

  const deleted = await courseService.deleteCourse(courseCode);

  if (!deleted) {
    req.flash('error', 'Course not found');
    return res.redirect('/courses');
  }

  req.flash('success', 'Course deleted successfully');
  res.redirect('/courses');
});

module.exports = {
  listCourses,
  showCourse,
  createCourseForm,
  createCourse,
  editCourseForm,
  updateCourse,
  deleteCourse,
};
