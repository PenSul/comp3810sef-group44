/**
 * @fileoverview Custom validation functions
 */

/**
 * Validates course code format
 * @param {string} courseCode - Course code
 * @returns {boolean} Validation result
 */
const isValidCourseCode = (courseCode) => {
  const regex = /^[A-Z]{4,8}\d{4}$/;
  return regex.test(courseCode);
};

/**
 * Validates email format
 * @param {string} email - Email address
 * @returns {boolean} Validation result
 */
const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Sanitizes HTML to prevent XSS
 * @param {string} html - HTML string
 * @returns {string} Sanitized string
 */
const sanitizeHtml = (html) => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  const reg = /[&<>"'/]/ig;
  return html.replace(reg, (match) => map[match]);
};

module.exports = {
  isValidCourseCode,
  isValidEmail,
  sanitizeHtml,
};
