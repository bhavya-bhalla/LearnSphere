import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  BookOpen,
  Users,
  Clock,
  Star,
  Filter,
  Search,
  Plus,
  Calendar,
  User,
  ChevronRight,
  Edit,
  Trash2,
  Eye,
} from 'lucide-react';
import { mockCourses } from '../../utils/mockData';
import toast from 'react-hot-toast';

const CourseList = () => {
  const { user } = useSelector((state) => state.auth);
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');

  useEffect(() => {
    // Load courses from localStorage (for newly created courses) and merge with mock data
    const storedCourses = JSON.parse(localStorage.getItem('courses') || '[]');
    const allCourses = [...mockCourses, ...storedCourses];
    
    // Filter courses based on user role
    let userCourses = allCourses;
    
    if (user?.role === 'instructor') {
      userCourses = allCourses.filter(course => course.instructorId === user.id);
    } else if (user?.role === 'student') {
      // Students see all active courses, with enrollment status
      userCourses = allCourses.filter(course => course.status === 'active');
    }
    
    setCourses(userCourses);
    setFilteredCourses(userCourses);
  }, [user]);

  useEffect(() => {
    let filtered = courses;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(course => course.category === selectedCategory);
    }

    // Level filter
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(course => course.level === selectedLevel);
    }

    setFilteredCourses(filtered);
  }, [courses, searchTerm, selectedCategory, selectedLevel]);

  const categories = [...new Set(courses.map(course => course.category))];
  const levels = [...new Set(courses.map(course => course.level))];

  const getLevelColor = (level) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isEnrolled = (courseId) => {
    return user?.enrolledCourses?.includes(courseId);
  };

  const handleDeleteCourse = (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      // Remove from localStorage
      const storedCourses = JSON.parse(localStorage.getItem('courses') || '[]');
      const updatedCourses = storedCourses.filter(course => course.id !== courseId);
      localStorage.setItem('courses', JSON.stringify(updatedCourses));
      
      // Update state
      setCourses(prev => prev.filter(course => course.id !== courseId));
      toast.success('Course deleted successfully');
    }
  };

  const handleEnrollCourse = (courseId) => {
    // Mock enrollment - in real app, this would call an API
    toast.success('Successfully enrolled in course!');
    
    // Update user's enrolled courses in localStorage for demo
    const enrolledCourses = JSON.parse(localStorage.getItem('enrolledCourses') || '[]');
    if (!enrolledCourses.includes(courseId)) {
      enrolledCourses.push(courseId);
      localStorage.setItem('enrolledCourses', JSON.stringify(enrolledCourses));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">
            {user?.role === 'instructor' ? 'My Courses' : 'Available Courses'}
          </h1>
          <p className="text-secondary-600 mt-1">
            {user?.role === 'instructor' 
              ? 'Manage and track your teaching courses'
              : 'Discover and enroll in courses to advance your learning'
            }
          </p>
        </div>
        
        {user?.role === 'instructor' && (
          <Link
            to="/create-course"
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Create Course</span>
          </Link>
        )}
      </div>

      {/* Statistics for Instructors */}
      {user?.role === 'instructor' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-secondary-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">Total Courses</p>
                <p className="text-2xl font-bold text-secondary-900">{courses.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-secondary-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">Total Students</p>
                <p className="text-2xl font-bold text-secondary-900">
                  {courses.reduce((sum, course) => sum + (course.enrolledStudents || 0), 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-secondary-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">Active Courses</p>
                <p className="text-2xl font-bold text-secondary-900">
                  {courses.filter(course => course.status === 'active').length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-secondary-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-600">Avg Rating</p>
                <p className="text-2xl font-bold text-secondary-900">4.8</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-secondary-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 h-4 w-4" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field pl-10 appearance-none"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Level Filter */}
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="input-field"
          >
            <option value="all">All Levels</option>
            {levels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>

          {/* Results Count */}
          <div className="flex items-center text-sm text-secondary-600">
            <span>{filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} found</span>
          </div>
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <div key={course.id} className="bg-white rounded-xl shadow-sm border border-secondary-200 overflow-hidden card-hover">
            <div className="relative">
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(course.level)}`}>
                  {course.level}
                </span>
              </div>
              {isEnrolled(course.id) && (
                <div className="absolute top-4 right-4">
                  <span className="bg-primary-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                    Enrolled
                  </span>
                </div>
              )}
              {course.createdAt && new Date(course.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
                <div className="absolute top-4 right-4">
                  <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                    New
                  </span>
                </div>
              )}
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-secondary-900 line-clamp-2">
                  {course.title}
                </h3>
              </div>

              <p className="text-secondary-600 text-sm mb-4 line-clamp-2">
                {course.description}
              </p>

              <div className="flex items-center space-x-4 mb-4 text-sm text-secondary-500">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  <span>{course.instructor}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{course.duration}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4 text-sm text-secondary-500">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{course.enrolledStudents || 0}/{course.maxStudents}</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-1 text-yellow-500" />
                    <span>4.8</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar for enrolled students */}
              {isEnrolled(course.id) && course.progress !== undefined && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-secondary-600 mb-1">
                    <span>Progress</span>
                    <span>{course.progress}%</span>
                  </div>
                  <div className="w-full bg-secondary-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary-500">{course.category}</span>
                
                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                  {user?.role === 'instructor' ? (
                    <>
                      <Link
                        to={`/courses/${course.id}`}
                        className="p-2 text-primary-600 hover:text-primary-700 rounded-lg hover:bg-primary-50"
                        title="View Course"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        to={`/courses/${course.id}/edit`}
                        className="p-2 text-secondary-600 hover:text-secondary-700 rounded-lg hover:bg-secondary-50"
                        title="Edit Course"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        className="p-2 text-red-600 hover:text-red-700 rounded-lg hover:bg-red-50"
                        title="Delete Course"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center space-x-2">
                      {!isEnrolled(course.id) && (
                        <button
                          onClick={() => handleEnrollCourse(course.id)}
                          className="btn-primary text-sm px-3 py-1"
                        >
                          Enroll
                        </button>
                      )}
                      <Link
                        to={`/courses/${course.id}`}
                        className="flex items-center text-primary-600 hover:text-primary-700 font-medium text-sm"
                      >
                        View Details
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 mb-2">No courses found</h3>
          <p className="text-secondary-600 mb-4">
            {user?.role === 'instructor' 
              ? 'Create your first course to get started.'
              : 'Try adjusting your search criteria or filters to find courses.'
            }
          </p>
          {user?.role === 'instructor' && (
            <Link
              to="/create-course"
              className="btn-primary"
            >
              Create Your First Course
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseList;