/**
 * @fileoverview Study material model schema
 */

const mongoose = require('mongoose');
const { MATERIAL_TYPES, SEMESTERS } = require('../config/constants');

const materialSchema = new mongoose.Schema(
  {
    courseCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    uploaderName: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      maxlength: 500,
      default: '',
    },
    type: {
      type: String,
      required: true,
      enum: MATERIAL_TYPES,
    },
    semester: {
      type: String,
      required: true,
      enum: SEMESTERS,
    },
    year: {
      type: Number,
      required: true,
      min: 2020,
      max: 2030,
    },
    fileType: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileData: {
      type: Buffer,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    downloadCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Material', materialSchema);
