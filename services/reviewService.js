/**
 * @fileoverview Review business logic service
 */

const Review = require('../models/Review');
const Course = require('../models/Course');
const statsService = require('./statsService');
const logger = require('../utils/logger');

/**
 * Creates a new review
 * @param {Object} reviewData - Review information
 * @returns {Promise<Object>} Created review
 */
const createReview = async (reviewData) => {
  try {
    const review = await Review.create(reviewData);

    // Update course statistics
    await statsService.updateCourseStats(reviewData.courseCode);

    logger.info(`Review created for ${reviewData.courseCode} by user ${reviewData.userId}`);
    return review;
  } catch (error) {
    if (error.code === 11000) {
      throw new Error('You have already reviewed this course');
    }
    logger.error(`Error creating review: ${error.message}`);
    throw error;
  }
};

/**
 * Finds reviews with filters
 * @param {Object} filters - Search filters
 * @returns {Promise<Array>} Array of reviews
 */
const findReviews = async (filters = {}) => {
  try {
    const query = {};

    // Filter by course code
    if (filters.courseCode) {
      query.courseCode = filters.courseCode.toUpperCase();
    }

    // Filter by user
    if (filters.userId) {
      query.userId = filters.userId;
    }

    // Filter by semester
    if (filters.semester) {
      query.semester = filters.semester;
    }

    // Filter by year
    if (filters.year) {
      query.year = parseInt(filters.year);
    }

    // Filter by instructor
    if (filters.instructor) {
      query.instructor = new RegExp(filters.instructor, 'i');
    }

    // Filter by rating
    if (filters.minRating) {
      query.rating = { $gte: parseFloat(filters.minRating) };
    }

    // Sorting
    let sortOptions = { createdAt: -1 }; // Default: newest first

    if (filters.sort === 'rating-high') {
      sortOptions = { rating: -1, createdAt: -1 };
    } else if (filters.sort === 'rating-low') {
      sortOptions = { rating: 1, createdAt: -1 };
    } else if (filters.sort === 'helpful') {
      sortOptions = { helpfulCount: -1, createdAt: -1 };
    }

    const reviews = await Review.find(query)
      .sort(sortOptions)
      .populate('userId', 'name photo');

    return reviews;
  } catch (error) {
    logger.error(`Error finding reviews: ${error.message}`);
    throw error;
  }
};

/**
 * Finds a review by ID
 * @param {string} reviewId - Review ID
 * @returns {Promise<Object>} Review object
 */
const findReviewById = async (reviewId) => {
  try {
    const review = await Review.findById(reviewId).populate('userId', 'name photo');
    return review;
  } catch (error) {
    logger.error(`Error finding review ${reviewId}: ${error.message}`);
    throw error;
  }
};

/**
 * Updates a review
 * @param {string} reviewId - Review ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated review
 */
const updateReview = async (reviewId, updateData) => {
  try {
    const review = await Review.findByIdAndUpdate(
      reviewId,
      updateData,
      { new: true, runValidators: true }
    );

    if (review) {
      // Update course statistics
      await statsService.updateCourseStats(review.courseCode);
      logger.info(`Review ${reviewId} updated`);
    }

    return review;
  } catch (error) {
    logger.error(`Error updating review ${reviewId}: ${error.message}`);
    throw error;
  }
};

/**
 * Deletes a review
 * @param {string} reviewId - Review ID
 * @returns {Promise<boolean>} Success status
 */
const deleteReview = async (reviewId) => {
  try {
    const review = await Review.findById(reviewId);

    if (!review) {
      return false;
    }

    const courseCode = review.courseCode;
    await Review.deleteOne({ _id: reviewId });

    // Update course statistics
    await statsService.updateCourseStats(courseCode);

    logger.info(`Review ${reviewId} deleted`);
    return true;
  } catch (error) {
    logger.error(`Error deleting review ${reviewId}: ${error.message}`);
    throw error;
  }
};

/**
 * Increments helpful count for a review
 * @param {string} reviewId - Review ID
 * @returns {Promise<Object>} Updated review
 */
const markReviewHelpful = async (reviewId) => {
  try {
    const review = await Review.findByIdAndUpdate(
      reviewId,
      { $inc: { helpfulCount: 1 } },
      { new: true }
    );
    return review;
  } catch (error) {
    logger.error(`Error marking review helpful: ${error.message}`);
    throw error;
  }
};

/**
 * Gets recent reviews
 * @param {number} limit - Number of reviews to return
 * @returns {Promise<Array>} Recent reviews
 */
const getRecentReviews = async (limit = 20) => {
  try {
    const reviews = await Review.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('userId', 'name photo');
    return reviews;
  } catch (error) {
    logger.error(`Error getting recent reviews: ${error.message}`);
    throw error;
  }
};

/**
 * Gets reviews by instructor
 * @param {string} instructorName - Instructor name
 * @returns {Promise<Array>} Reviews for instructor
 */
const getReviewsByInstructor = async (instructorName) => {
  try {
    const reviews = await Review.find({
      instructor: new RegExp(instructorName, 'i')
    })
      .sort({ createdAt: -1 })
      .populate('userId', 'name photo');
    return reviews;
  } catch (error) {
    logger.error(`Error getting reviews for instructor: ${error.message}`);
    throw error;
  }
};

module.exports = {
  createReview,
  findReviews,
  findReviewById,
  updateReview,
  deleteReview,
  markReviewHelpful,
  getRecentReviews,
  getReviewsByInstructor,
};
