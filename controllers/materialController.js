/**
 * @fileoverview Study material controller
 */

const materialService = require('../services/materialService');
const courseService = require('../services/courseService');
const { asyncHandler } = require('../middleware/errorHandler');
const { MATERIAL_TYPES, SEMESTERS } = require('../config/constants');
const multer = require('multer');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, PPT, PPTX are allowed.'));
    }
  },
});

/**
 * Renders material upload form
 */
const uploadMaterialForm = asyncHandler(async (req, res) => {
  const { courseCode } = req.query;

  let course = null;
  if (courseCode) {
    course = await courseService.findCourseByCode(courseCode);
  }

  res.render('pages/materials/upload', {
    title: 'Upload Material - HKMU CourseHub',
    course,
    materialTypes: MATERIAL_TYPES,
    semesters: SEMESTERS,
  });
});

/**
 * Handles material upload
 */
const uploadMaterial = asyncHandler(async (req, res) => {
  if (!req.file) {
    req.flash('error', 'Please select a file to upload');
    return res.redirect('back');
  }

  const materialData = {
    courseCode: req.body.courseCode.toUpperCase(),
    uploadedBy: req.user._id,
    uploaderName: req.user.name,
    title: req.body.title,
    description: req.body.description || '',
    type: req.body.type,
    semester: req.body.semester,
    year: parseInt(req.body.year),
  };

  await materialService.uploadMaterial(materialData, req.file);

  req.flash('success', 'Material uploaded successfully');
  res.redirect(`/courses/${materialData.courseCode}`);
});

/**
 * Handles material download
 */
const downloadMaterial = asyncHandler(async (req, res) => {
  const { materialId } = req.params;
  const material = await materialService.findMaterialById(materialId);

  if (!material) {
    req.flash('error', 'Material not found');
    return res.redirect('/courses');
  }

  // Set headers for file download
  res.setHeader('Content-Type', material.fileType);
  res.setHeader('Content-Disposition', `attachment; filename="${material.fileName}"`);
  res.setHeader('Content-Length', material.fileSize);

  res.send(material.fileData);
});

/**
 * Handles material deletion
 */
const deleteMaterial = asyncHandler(async (req, res) => {
  const { materialId } = req.params;
  const material = await materialService.findMaterialById(materialId);

  if (!material) {
    req.flash('error', 'Material not found');
    return res.redirect('/courses');
  }

  // Check ownership or admin
  if (material.uploadedBy.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    req.flash('error', 'You can only delete your own materials');
    return res.redirect(`/courses/${material.courseCode}`);
  }

  const courseCode = material.courseCode;
  await materialService.deleteMaterial(materialId);

  req.flash('success', 'Material deleted successfully');
  res.redirect(`/courses/${courseCode}`);
});

module.exports = {
  upload,
  uploadMaterialForm,
  uploadMaterial,
  downloadMaterial,
  deleteMaterial,
};
