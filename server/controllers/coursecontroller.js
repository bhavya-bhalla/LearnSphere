const Course = require('../models/course');

// @desc    Create new course
// @route   POST /api/courses
exports.createCourse = async (req, res) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json(course);
  } catch (error) {
    console.error('Create Course Error:', error);
    res.status(400).json({ error: error.message });
  }
};

// @desc    Get all courses
// @route   GET /api/courses
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.status(200).json(courses);
  } catch (error) {
    console.error('Get Courses Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Get single course by ID
// @route   GET /api/courses/:id
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.status(200).json(course);
  } catch (error) {
    console.error('Get Course Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
