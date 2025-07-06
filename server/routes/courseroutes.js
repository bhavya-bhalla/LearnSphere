const express = require('express');
const router = express.Router();
const { createCourse, getAllCourses, getCourseById } = require('../controllers/coursecontroller');

// Public Routes
router.get('/', getAllCourses);
router.get('/:id', getCourseById);

// Protected (you can later add auth middleware)
router.post('/', createCourse);

module.exports = router;
