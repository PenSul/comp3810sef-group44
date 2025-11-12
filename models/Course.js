/**
 * @fileoverview Course model schema
 */

const mongoose = require('mongoose');
const { PROGRAMS } = require('../config/constants');

const courseSchema = new mongoose.Schema(
  {
    courseCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    courseName: {
      type: String,
      required: true,
      trim: true,
    },
    program: {
      type: String,
      required: true,
      enum: PROGRAMS,
    },
    credits: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    description: {
      type: String,
      required: true,
    },
    prerequisites: [
      {
        type: String,
        trim: true,
      },
    ],
    instructors: [
      {
        type: String,
        trim: true,
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    averageDifficulty: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    averageWorkload: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Course', courseSchema);
