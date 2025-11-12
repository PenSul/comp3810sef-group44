/**
 * @fileoverview Study material business logic service
 */

const Material = require('../models/Material');
const logger = require('../utils/logger');
const { MAX_FILE_SIZE } = require('../config/constants');

/**
 * Uploads a new material
 * @param {Object} materialData - Material information
 * @param {Object} file - Uploaded file
 * @returns {Promise<Object>} Created material
 */
const uploadMaterial = async (materialData, file) => {
  try {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('File size exceeds 10MB limit');
    }

    // Create material document
    const material = await Material.create({
      ...materialData,
      fileData: file.buffer,
      fileSize: file.size,
      fileType: file.mimetype,
      fileName: file.originalname,
    });

    logger.info(`Material uploaded: ${material.title} for ${material.courseCode}`);
    return material;
  } catch (error) {
    logger.error(`Error uploading material: ${error.message}`);
    throw error;
  }
};

/**
 * Finds materials with filters
 * @param {Object} filters - Search filters
 * @returns {Promise<Array>} Array of materials (without file data)
 */
const findMaterials = async (filters = {}) => {
  try {
    const query = {};

    // Filter by course code
    if (filters.courseCode) {
      query.courseCode = filters.courseCode.toUpperCase();
    }

    // Filter by type
    if (filters.type) {
      query.type = filters.type;
    }

    // Filter by semester
    if (filters.semester) {
      query.semester = filters.semester;
    }

    // Filter by year
    if (filters.year) {
      query.year = parseInt(filters.year);
    }

    // Filter by uploader
    if (filters.uploadedBy) {
      query.uploadedBy = filters.uploadedBy;
    }

    const materials = await Material.find(query)
      .select('-fileData') // Exclude file data for listing
      .sort({ createdAt: -1 })
      .populate('uploadedBy', 'name');

    return materials;
  } catch (error) {
    logger.error(`Error finding materials: ${error.message}`);
    throw error;
  }
};

/**
 * Finds a material by ID with file data
 * @param {string} materialId - Material ID
 * @returns {Promise<Object>} Material with file data
 */
const findMaterialById = async (materialId) => {
  try {
    const material = await Material.findById(materialId);

    if (material) {
      // Increment download count
      material.downloadCount += 1;
      await material.save();
    }

    return material;
  } catch (error) {
    logger.error(`Error finding material ${materialId}: ${error.message}`);
    throw error;
  }
};

/**
 * Deletes a material
 * @param {string} materialId - Material ID
 * @returns {Promise<boolean>} Success status
 */
const deleteMaterial = async (materialId) => {
  try {
    const result = await Material.deleteOne({ _id: materialId });

    if (result.deletedCount > 0) {
      logger.info(`Material ${materialId} deleted`);
      return true;
    }

    return false;
  } catch (error) {
    logger.error(`Error deleting material ${materialId}: ${error.message}`);
    throw error;
  }
};

/**
 * Gets materials for a course
 * @param {string} courseCode - Course code
 * @returns {Promise<Array>} Materials for course
 */
const getMaterialsByCourse = async (courseCode) => {
  try {
    const materials = await Material.find({
      courseCode: courseCode.toUpperCase()
    })
      .select('-fileData')
      .sort({ createdAt: -1 })
      .populate('uploadedBy', 'name');

    return materials;
  } catch (error) {
    logger.error(`Error getting materials for ${courseCode}: ${error.message}`);
    throw error;
  }
};

module.exports = {
  uploadMaterial,
  findMaterials,
  findMaterialById,
  deleteMaterial,
  getMaterialsByCourse,
};
