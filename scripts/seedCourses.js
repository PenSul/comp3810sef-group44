require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('../models/Course');

const courses = [
  {
    courseCode: 'COMP3810SEF',
    courseName: 'Server-side Technologies And Cloud Computing',
    program: 'Computer Science',
    credits: 3,
    description: 'This course focuses on developing students capabilities in writing programs that run on computer networks and leverage modern, scalable infrastructure.',
    level: 'Year 3',
    prerequisites: [],
    corequisites: [],
    instructors: ['Dr. Yishu Li'],
    semester: ['Autumn'],
    status: 'Active'
  },
];

async function seedCourses() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing courses (optional - remove if you want to keep existing)
    // await Course.deleteMany({});
    // console.log('Cleared existing courses');

    // Insert courses
    const result = await Course.insertMany(courses);
    console.log(`Successfully created ${result.length} courses`);

    // Display created courses
    result.forEach(course => {
      console.log(`   - ${course.courseCode}: ${course.courseName}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding courses:', error);
    process.exit(1);
  }
}

seedCourses();
