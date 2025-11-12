/**
 * @fileoverview Course business logic service
 */

const Course = require('../models/Course');
const Review = require('../models/Review');
const logger = require('../utils/logger');

/**
 * Creates a new course
 * @param {Object} courseData - Course information
 * @returns {Promise<Object>} Created course
 */
const createCourse = async (courseData) => {
  try {
    const course = await Course.create(courseData);
    logger.info(`Course created: ${course.courseCode}`);
    return course;
  } catch (error) {
    logger.error(`Error creating course: ${error.message}`);
    throw error;
  }
};

/**
 * Finds all courses with optional filters
 * @param {Object} filters - Search filters
 * @returns {Promise<Array>} Array of courses
 */
const findCourses = async (filters = {}) => {
  try {
    const query = {};

    // Search by keyword (course code or name)
    if (filters.search) {
      query.$or = [
        { courseCode: new RegExp(filters.search, 'i') },
        { courseName: new RegExp(filters.search, 'i') },
      ];
    }

    // Filter by program
    if (filters.program) {
      query.program = filters.program;
    }

    // Filter by minimum rating
    if (filters.minRating) {
      query.averageRating = { $gte: parseFloat(filters.minRating) };
    }

    // Filter by difficulty
    if (filters.difficulty) {
      const difficultyMap = {
        easy: { $lte: 2 },
        medium: { $gte: 2, $lte: 4 },
        hard: { $gte: 4 },
      };
      query.averageDifficulty = difficultyMap[filters.difficulty];
    }

    // Filter by instructor
    if (filters.instructor) {
      query.instructors = new RegExp(filters.instructor, 'i');
    }

    // Sorting
    let sortOptions = {};
    switch (filters.sort) {
      case 'rating-high':
        sortOptions = { averageRating: -1 };
        break;
      case 'rating-low':
        sortOptions = { averageRating: 1 };
        break;
      case 'reviews-most':
        sortOptions = { reviewCount: -1 };
        break;
      case 'difficulty-easy':
        sortOptions = { averageDifficulty: 1 };
        break;
      case 'difficulty-hard':
        sortOptions = { averageDifficulty: -1 };
        break;
      default:
        sortOptions = { courseCode: 1 };
    }

    const courses = await Course.find(query).sort(sortOptions);
    return courses;
  } catch (error) {
    logger.error(`Error finding courses: ${error.message}`);
    throw error;
  }
};

/**
 * Finds a course by code
 * @param {string} courseCode - Course code
 * @returns {Promise<Object>} Course object
 */
const findCourseByCode = async (courseCode) => {
  try {
    const course = await Course.findOne({
      courseCode: courseCode.toUpperCase()
    });
    return course;
  } catch (error) {
    logger.error(`Error finding course ${courseCode}: ${error.message}`);
    throw error;
  }
};

/**
 * Updates a course
 * @param {string} courseCode - Course code
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated course
 */
const updateCourse = async (courseCode, updateData) => {
  try {
    const course = await Course.findOneAndUpdate(
      { courseCode: courseCode.toUpperCase() },
      updateData,
      { new: true, runValidators: true }
    );

    if (course) {
      logger.info(`Course updated: ${courseCode}`);
    }

    return course;
  } catch (error) {
    logger.error(`Error updating course ${courseCode}: ${error.message}`);
    throw error;
  }
};

/**
 * Deletes a course
 * @param {string} courseCode - Course code
 * @returns {Promise<boolean>} Success status
 */
const deleteCourse = async (courseCode) => {
  try {
    // Delete all reviews for this course
    await Review.deleteMany({ courseCode: courseCode.toUpperCase() });

    // Delete the course
    const result = await Course.deleteOne({
      courseCode: courseCode.toUpperCase()
    });

    if (result.deletedCount > 0) {
      logger.info(`Course deleted: ${courseCode}`);
      return true;
    }

    return false;
  } catch (error) {
    logger.error(`Error deleting course ${courseCode}: ${error.message}`);
    throw error;
  }
};

/**
 * Gets top rated courses
 * @param {number} limit - Number of courses to return
 * @returns {Promise<Array>} Top rated courses
 */
const getTopRatedCourses = async (limit = 10) => {
  try {
    const courses = await Course.find({ reviewCount: { $gt: 0 } })
      .sort({ averageRating: -1, reviewCount: -1 })
      .limit(limit);
    return courses;
  } catch (error) {
    logger.error(`Error getting top rated courses: ${error.message}`);
    throw error;
  }
};

module.exports = {
  createCourse,
  findCourses,
  findCourseByCode,
  updateCourse,
  deleteCourse,
  getTopRatedCourses,
};
