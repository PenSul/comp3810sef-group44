/**
 * @fileoverview Request validation middleware using express-validator
 */

const { body, param, query, validationResult } = require('express-validator');
const { SEMESTERS, GRADES, MATERIAL_TYPES, PROGRAMS } = require('../config/constants');

/**
 * Handles validation errors
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => err.msg);
    req.flash('error', errorMessages.join(', '));
    return res.redirect('back');
  }

  next();
};

/**
 * Validation rules for course creation
 */
const validateCourse = [
  body('courseCode')
    .trim()
    .notEmpty()
    .withMessage('Course code is required')
    .isLength({ min: 6, max: 15 })
    .withMessage('Course code must be between 6 and 15 characters')
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Course code must contain only uppercase letters and numbers'),

  body('courseName')
    .trim()
    .notEmpty()
    .withMessage('Course name is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Course name must be between 3 and 200 characters'),

  body('program')
    .notEmpty()
    .withMessage('Program is required')
    .isIn(PROGRAMS)
    .withMessage('Invalid program selected'),

  body('credits')
    .isInt({ min: 1, max: 10 })
    .withMessage('Credits must be between 1 and 10'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 50, max: 2000 })
    .withMessage('Description must be between 50 and 2000 characters'),

  handleValidationErrors,
];

/**
 * Validation rules for review creation/update
 */
const validateReview = [
  body('courseCode')
    .trim()
    .notEmpty()
    .withMessage('Course code is required'),

  body('semester')
    .notEmpty()
    .withMessage('Semester is required')
    .isIn(SEMESTERS)
    .withMessage('Invalid semester'),

  body('year')
    .isInt({ min: 2020, max: 2030 })
    .withMessage('Year must be between 2020 and 2030'),

  body('instructor')
    .trim()
    .notEmpty()
    .withMessage('Instructor name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Instructor name must be between 2 and 100 characters'),

  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),

  body('difficulty')
    .isInt({ min: 1, max: 5 })
    .withMessage('Difficulty must be between 1 and 5'),

  body('workload')
    .isInt({ min: 1, max: 5 })
    .withMessage('Workload must be between 1 and 5'),

  body('grade')
    .optional({ checkFalsy: true })
    .isIn(GRADES)
    .withMessage('Invalid grade'),

  body('reviewText')
    .trim()
    .notEmpty()
    .withMessage('Review text is required')
    .isLength({ min: 50, max: 2000 })
    .withMessage('Review must be between 50 and 2000 characters'),

  body('pros')
    .optional()
    .isArray()
    .withMessage('Pros must be an array'),

  body('cons')
    .optional()
    .isArray()
    .withMessage('Cons must be an array'),

  body('tips')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Tips must not exceed 500 characters'),

  handleValidationErrors,
];

/**
 * Validation rules for material upload
 */
const validateMaterial = [
  body('courseCode')
    .trim()
    .notEmpty()
    .withMessage('Course code is required'),

  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),

  body('type')
    .notEmpty()
    .withMessage('Material type is required')
    .isIn(MATERIAL_TYPES)
    .withMessage('Invalid material type'),

  body('semester')
    .notEmpty()
    .withMessage('Semester is required')
    .isIn(SEMESTERS)
    .withMessage('Invalid semester'),

  body('year')
    .isInt({ min: 2020, max: 2030 })
    .withMessage('Year must be between 2020 and 2030'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),

  handleValidationErrors,
];

/**
 * Validation rules for API review creation
 */
const validateApiReview = [
  body('courseCode')
    .trim()
    .notEmpty()
    .withMessage('Course code is required'),

  body('semester')
    .notEmpty()
    .withMessage('Semester is required')
    .isIn(SEMESTERS)
    .withMessage('Invalid semester'),

  body('year')
    .isInt({ min: 2020, max: 2030 })
    .withMessage('Year must be between 2020 and 2030'),

  body('instructor')
    .trim()
    .notEmpty()
    .withMessage('Instructor name is required'),

  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),

  body('difficulty')
    .isInt({ min: 1, max: 5 })
    .withMessage('Difficulty must be between 1 and 5'),

  body('workload')
    .isInt({ min: 1, max: 5 })
    .withMessage('Workload must be between 1 and 5'),

  body('reviewText')
    .trim()
    .notEmpty()
    .withMessage('Review text is required')
    .isLength({ min: 50, max: 2000 })
    .withMessage('Review must be between 50 and 2000 characters'),
];

/**
 * Returns validation errors as JSON for API
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const handleApiValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((err) => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }

  next();
};

module.exports = {
  validateCourse,
  validateReview,
  validateMaterial,
  validateApiReview,
  handleApiValidationErrors,
};
