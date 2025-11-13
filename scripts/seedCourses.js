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
  {
    courseCode: 'COMP3500SEF',
    courseName: 'Software Engineering',
    program: 'Computer Science',
    credits: 3,
    description: 'This course aims to introduce the concepts and applications of software engineering, explain their potential impacts on software productivity, quality assurance, cost and time to market during different software life cycles.',
    level: 'Year 3',
    prerequisites: [],
    corequisites: [],
    instructors: ['Dr. Ndudi Ezeamuzie'],
    semester: ['Autumn'],
    status: 'Active'
  },
  {
    courseCode: 'COMP3120SEF',
    courseName: 'Java Application Development',
    program: 'Computer Science',
    credits: 3,
    description: 'This course aims to enable students to create maintainable software in Java to meet a great variety of computing requirements.',
    level: 'Year 3',
    prerequisites: [],
    corequisites: [],
    instructors: ['Dr. TSE Ka Wing'],
    semester: ['Autumn'],
    status: 'Active'
  },
  {
    courseCode: 'COMP3200SEF',
    courseName: 'Database Management',
    program: 'Computer Science',
    credits: 3,
    description: 'This course describe essential principles and concepts of database management systems, perform data manipulation and extraction tasks effectively using SQL and Utilize the relational model to solve data modelling problems.',
    level: 'Year 3',
    prerequisites: [],
    corequisites: [],
    instructors: ['Dr. Wyman Wang'],
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
