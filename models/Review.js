/**
 * @fileoverview Review model schema
 */

const mongoose = require('mongoose');
const { SEMESTERS, GRADES } = require('../config/constants');

const reviewSchema = new mongoose.Schema(
  {
    courseCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userPhoto: {
      type: String,
      default: '',
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
    instructor: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    difficulty: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    workload: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    grade: {
      type: String,
      enum: [...GRADES, ''],
      default: '',
    },
    reviewText: {
      type: String,
      required: true,
      minlength: 50,
      maxlength: 2000,
    },
    pros: [
      {
        type: String,
        trim: true,
        maxlength: 200,
      },
    ],
    cons: [
      {
        type: String,
        trim: true,
        maxlength: 200,
      },
    ],
    tips: {
      type: String,
      maxlength: 500,
      default: '',
    },
    helpfulCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Review', reviewSchema);
