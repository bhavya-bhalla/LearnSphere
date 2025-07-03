import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ArrowLeft,
  Play,
  FileText,
  Users,
  Clock,
  Calendar,
  Star,
  CheckCircle,
  Lock,
  Download,
  MessageSquare,
  Award,
  BookOpen,
} from 'lucide-react';
import { mockCourses } from '../../utils/mockData';
import toast from 'react-hot-toast';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [course, setCourse] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    const foundCourse = mockCourses.find(c => c.id === parseInt(id));
    if (foundCourse) {
      setCourse(foundCourse);
      setIsEnrolled(user?.enrolledCourses?.includes(foundCourse.id) || false);
    }
  }, [id, user]);

  const handleEnroll = () => {
    if (!user) {
      toast.error('Please login to enroll in courses');
      navigate('/login');
      return;
    }

    if (course.enrolledStudents >= course.maxStudents) {
      toast.error('Course is full');
      return;
    }

    setIsEnrolled(true);
    toast.success('Successfully enrolled in course!');
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'modules', label: 'Modules', icon: Play },
    { id: 'assignments', label: 'Assignments', icon: FileText },
    { id: 'discussions', label: 'Discussions', icon: MessageSquare },
  ];

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        to="/courses"
        className="inline-flex items-center text-secondary-600 hover:text-secondary-900 transition-colors duration-200"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Courses
      </Link>

      {/* Course Header */}
      <div className="bg-white rounded-xl shadow-sm border border-secondary-200 overflow-hidden">
        <div className="relative h-64 md:h-80">
          <img
            src={course.image}
            alt={course.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40" />
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <div className="flex items-center space-x-2 mb-2">
              <span className="bg-primary-600 px-2 py-1 rounded text-sm font-medium">
                {course.level}
              </span>
              <span className="bg-secondary-800 bg-opacity-75 px-2 py-1 rounded text-sm">
                {course.category}
              </span>
            </div>
            <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
            <p className="text-lg opacity-90 mb-4">{course.description}</p>
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                <span>{course.instructor}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{course.duration}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{new Date(course.startDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center">
                <Star className="h-4 w-4 mr-1 text-yellow-400" />
                <span>4.8 (124 reviews)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary-900">
                  {course.enrolledStudents}
                </div>
                <div className="text-sm text-secondary-600">Students</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary-900">
                  {course.modules?.length || 0}
                </div>
                <div className="text-sm text-secondary-600">Modules</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary-900">
                  {course.assignments?.length || 0}
                </div>
                <div className="text-sm text-secondary-600">Assignments</div>
              </div>
            </div>

            {user?.role === 'student' && !isEnrolled && (
              <button
                onClick={handleEnroll}
                className="btn-primary px-8 py-3 text-lg"
                disabled={course.enrolledStudents >= course.maxStudents}
              >
                {course.enrolledStudents >= course.maxStudents ? 'Course Full' : 'Enroll Now'}
              </button>
            )}

            {isEnrolled && course.progress !== undefined && (
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">
                  {course.progress}%
                </div>
                <div className="text-sm text-secondary-600">Complete</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-secondary-200">
        <div className="border-b border-secondary-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-secondary-600 hover:text-secondary-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-3">Course Description</h3>
                <p className="text-secondary-700 leading-relaxed">
                  {course.description} This comprehensive course will take you through all the essential concepts
                  and practical applications. You'll work on real-world projects and gain hands-on experience
                  that will prepare you for professional challenges.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-3">What You'll Learn</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-secondary-700">Master the fundamental concepts and best practices</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-secondary-700">Build real-world projects from scratch</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-secondary-700">Understand industry standards and workflows</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-secondary-700">Prepare for professional certification</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-3">Prerequisites</h3>
                <ul className="space-y-1 text-secondary-700">
                  <li>• Basic understanding of programming concepts</li>
                  <li>• Familiarity with web technologies (HTML, CSS)</li>
                  <li>• Access to a computer with internet connection</li>
                </ul>
              </div>
            </div>
          )}

          {/* Modules Tab */}
          {activeTab === 'modules' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-secondary-900">Course Modules</h3>
              {course.modules?.map((module, index) => (
                <div
                  key={module.id}
                  className="border border-secondary-200 rounded-lg p-4 hover:bg-secondary-50 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {module.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : isEnrolled ? (
                        <Play className="h-5 w-5 text-primary-600" />
                      ) : (
                        <Lock className="h-5 w-5 text-secondary-400" />
                      )}
                      <div>
                        <h4 className="font-medium text-secondary-900">
                          Module {index + 1}: {module.title}
                        </h4>
                        <p className="text-sm text-secondary-600">
                          {module.completed ? 'Completed' : isEnrolled ? 'Available' : 'Locked'}
                        </p>
                      </div>
                    </div>
                    {isEnrolled && (
                      <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                        {module.completed ? 'Review' : 'Start'}
                      </button>
                    )}
                  </div>
                </div>
              )) || (
                <p className="text-secondary-600">No modules available yet.</p>
              )}
            </div>
          )}

          {/* Assignments Tab */}
          {activeTab === 'assignments' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-secondary-900">Assignments</h3>
              {course.assignments?.map((assignment) => (
                <div
                  key={assignment.id}
                  className="border border-secondary-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-secondary-900">{assignment.title}</h4>
                    <div className="flex items-center space-x-2">
                      {assignment.submitted && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                          Submitted
                        </span>
                      )}
                      {assignment.grade && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                          Grade: {assignment.grade}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-secondary-600">
                    <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                    {isEnrolled && (
                      <Link
                        to={`/assignments/${assignment.id}`}
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        {assignment.submitted ? 'View Submission' : 'Submit Assignment'}
                      </Link>
                    )}
                  </div>
                </div>
              )) || (
                <p className="text-secondary-600">No assignments available yet.</p>
              )}
            </div>
          )}

          {/* Discussions Tab */}
          {activeTab === 'discussions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-secondary-900">Course Discussions</h3>
                {isEnrolled && (
                  <Link
                    to={`/discussions/create?courseId=${course.id}`}
                    className="btn-primary"
                  >
                    Start Discussion
                  </Link>
                )}
              </div>
              
              <div className="space-y-3">
                <div className="border border-secondary-200 rounded-lg p-4">
                  <h4 className="font-medium text-secondary-900 mb-2">Help with useState Hook</h4>
                  <p className="text-sm text-secondary-600 mb-2">
                    I am having trouble understanding when to use useState vs useEffect...
                  </p>
                  <div className="flex items-center justify-between text-xs text-secondary-500">
                    <span>By John Smith • 2 days ago</span>
                    <span>3 replies</span>
                  </div>
                </div>
                
                {!isEnrolled && (
                  <div className="text-center py-8 text-secondary-600">
                    <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Enroll in this course to participate in discussions</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;