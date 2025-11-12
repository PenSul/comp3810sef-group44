/**
 * @fileoverview Statistics calculation service
 */

const Review = require('../models/Review');
const Course = require('../models/Course');
const logger = require('../utils/logger');

/**
 * Updates course statistics based on reviews
 * @param {string} courseCode - Course code
 * @returns {Promise<void>}
 */
const updateCourseStats = async (courseCode) => {
  try {
    const reviews = await Review.find({
      courseCode: courseCode.toUpperCase()
    });

    if (reviews.length === 0) {
      // No reviews, reset stats
      await Course.findOneAndUpdate(
        { courseCode: courseCode.toUpperCase() },
        {
          averageRating: 0,
          averageDifficulty: 0,
          averageWorkload: 0,
          reviewCount: 0,
        }
      );
      return;
    }

    // Calculate averages
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const totalDifficulty = reviews.reduce((sum, r) => sum + r.difficulty, 0);
    const totalWorkload = reviews.reduce((sum, r) => sum + r.workload, 0);

    const averageRating = (totalRating / reviews.length).toFixed(2);
    const averageDifficulty = (totalDifficulty / reviews.length).toFixed(2);
    const averageWorkload = (totalWorkload / reviews.length).toFixed(2);

    // Update course
    await Course.findOneAndUpdate(
      { courseCode: courseCode.toUpperCase() },
      {
        averageRating: parseFloat(averageRating),
        averageDifficulty: parseFloat(averageDifficulty),
        averageWorkload: parseFloat(averageWorkload),
        reviewCount: reviews.length,
      }
    );

    logger.info(`Statistics updated for ${courseCode}`);
  } catch (error) {
    logger.error(`Error updating stats for ${courseCode}: ${error.message}`);
    throw error;
  }
};

/**
 * Gets difficulty distribution
 * @returns {Promise<Object>} Difficulty distribution
 */
const getDifficultyDistribution = async () => {
  try {
    const distribution = await Review.aggregate([
      {
        $bucket: {
          groupBy: '$difficulty',
          boundaries: [1, 2, 3, 4, 5, 6],
          default: 'Other',
          output: {
            count: { $sum: 1 },
          },
        },
      },
    ]);

    return distribution;
  } catch (error) {
    logger.error(`Error getting difficulty distribution: ${error.message}`);
    throw error;
  }
};

module.exports = {
  updateCourseStats,
  getDifficultyDistribution,
};
