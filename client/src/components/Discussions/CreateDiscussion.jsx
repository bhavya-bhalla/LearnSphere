
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ArrowLeft,
  Save,
  MessageSquare,
  BookOpen,
  AlertCircle,
  Pin,
  Send,
} from 'lucide-react';
import { mockCourses } from '../../utils/mockData';
import { eventBus, EVENTS } from '../../utils/eventBus';
import toast from 'react-hot-toast';

const CreateDiscussion = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useSelector((state) => state.auth);
  const [discussionData, setDiscussionData] = useState({
    title: '',
    content: '',
    courseId: searchParams.get('courseId') || '',
    pinned: false,
    anonymous: false,
  });

  // Get courses based on user role - FIXED to include approved courses
  const getAvailableCourses = () => {
    // Get courses from both mock data and localStorage (approved courses)
    const storedCourses = JSON.parse(localStorage.getItem('courses') || '[]');
    const allCourses = [...mockCourses, ...storedCourses];
    
    if (user?.role === 'student') {
      // Students can only post in courses they're enrolled in
      const enrolledCourses = user.enrolledCourses || [1, 2]; // Default enrolled courses for demo
      
      // Also check approved enrollments
      const approvedEnrollments = JSON.parse(localStorage.getItem('approvedEnrollments') || '[]');
      const userApprovedEnrollments = approvedEnrollments.filter(enrollment => enrollment.studentId === user.id);
      const approvedCourseIds = userApprovedEnrollments.map(enrollment => enrollment.courseId);
      
      // Combine enrolled and approved course IDs
      const allEnrolledCourseIds = [...new Set([...enrolledCourses, ...approvedCourseIds])];
      
      return allCourses.filter(course => 
        course.status === 'active' && allEnrolledCourseIds.includes(course.id)
      );
    } else if (user?.role === 'instructor') {
      // Instructors can post in courses they teach - FIXED to include approved courses
      return allCourses.filter(course => 
        course.instructorId === user.id && course.status === 'active'
      );
    }
    
    // Admin can post in any active course
    return allCourses.filter(course => course.status === 'active');
  };

  const availableCourses = getAvailableCourses();

  const handleInputChange = (field, value) => {
    setDiscussionData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateDiscussion = () => {
    if (!discussionData.title || !discussionData.content || !discussionData.courseId) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Create new discussion object
    const newDiscussion = {
      id: Date.now(),
      ...discussionData,
      courseId: parseInt(discussionData.courseId),
      courseName: availableCourses.find(c => c.id === parseInt(discussionData.courseId))?.title,
      author: user?.name,
      authorId: user?.id,
      date: new Date().toISOString(),
      replies: [],
      views: 0,
      likes: 0,
      status: 'active',
    };

    // Save to localStorage
    const existingDiscussions = JSON.parse(localStorage.getItem('discussions') || '[]');
    existingDiscussions.push(newDiscussion);
    localStorage.setItem('discussions', JSON.stringify(existingDiscussions));

    // Emit event for real-time updates
    eventBus.emit(EVENTS.DISCUSSION_CREATED, newDiscussion);

    toast.success('Discussion created successfully!');
    navigate('/discussions');
  };

  const handleSaveDraft = () => {
    if (!discussionData.title) {
      toast.error('Please enter a title to save as draft');
      return;
    }

    const draft = {
      ...discussionData,
      id: Date.now(),
      status: 'draft',
      savedAt: new Date().toISOString(),
    };

    const drafts = JSON.parse(localStorage.getItem('discussionDrafts') || '[]');
    drafts.push(draft);
    localStorage.setItem('discussionDrafts', JSON.stringify(drafts));

    toast.success('Discussion saved as draft');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/discussions')}
            className="flex items-center text-secondary-600 hover:text-secondary-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Discussions
          </button>
          <h1 className="text-2xl font-bold text-secondary-900">Start New Discussion</h1>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleSaveDraft}
            className="btn-secondary flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>Save Draft</span>
          </button>
          <button
            onClick={handleCreateDiscussion}
            className="btn-primary flex items-center space-x-2"
          >
            <Send className="h-4 w-4" />
            <span>Post Discussion</span>
          </button>
        </div>
      </div>

      {/* No Access Message */}
      {availableCourses.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-6 w-6 text-yellow-600" />
            <div>
              <h3 className="text-lg font-medium text-yellow-800">No Course Access</h3>
              <p className="text-yellow-700 mt-1">
                {user?.role === 'student' 
                  ? 'You need to be enrolled in courses to start discussions. Please enroll in courses first.'
                  : user?.role === 'instructor'
                  ? 'You need to have active courses to start discussions. Please create or wait for course approval.'
                  : 'No active courses available for discussions.'
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Form */}
      {availableCourses.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-secondary-200">
          <div className="space-y-6">
            {/* Course Selection */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Course *
              </label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 h-4 w-4" />
                <select
                  value={discussionData.courseId}
                  onChange={(e) => handleInputChange('courseId', e.target.value)}
                  className="input-field pl-10"
                  required
                >
                  <option value="">Select a course</option>
                  {availableCourses.map(course => (
                    <option key={course.id} value={course.id}>{course.title}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Discussion Title */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Discussion Title *
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 h-4 w-4" />
                <input
                  type="text"
                  value={discussionData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="input-field pl-10"
                  placeholder="Enter a clear, descriptive title for your discussion"
                  required
                />
              </div>
            </div>

            {/* Discussion Content */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Discussion Content *
              </label>
              <textarea
                value={discussionData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                className="input-field h-40 resize-none"
                placeholder="Share your thoughts, ask questions, or start a conversation..."
                required
              />
              <div className="text-xs text-secondary-500 mt-1">
                Be respectful and constructive in your discussions. Follow community guidelines.
              </div>
            </div>

            {/* Options */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-secondary-700">Discussion Options</h3>
              
              <div className="flex flex-wrap gap-4">
                {user?.role === 'instructor' && (
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={discussionData.pinned}
                      onChange={(e) => handleInputChange('pinned', e.target.checked)}
                      className="text-primary-600 focus:ring-primary-500 mr-2"
                    />
                    <Pin className="h-4 w-4 mr-1 text-secondary-600" />
                    Pin this discussion
                  </label>
                )}
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={discussionData.anonymous}
                    onChange={(e) => handleInputChange('anonymous', e.target.checked)}
                    className="text-primary-600 focus:ring-primary-500 mr-2"
                  />
                  Post anonymously
                </label>
              </div>
            </div>

            {/* Guidelines */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-blue-800">Discussion Guidelines</h3>
                  <ul className="text-sm text-blue-700 mt-1 space-y-1">
                    <li>• Be respectful and constructive in your discussions</li>
                    <li>• Stay on topic and relevant to the course material</li>
                    <li>• Use clear and descriptive titles</li>
                    <li>• Search existing discussions before creating new ones</li>
                    <li>• Follow academic integrity policies</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Section */}
      {discussionData.title && discussionData.content && availableCourses.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-secondary-200">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Preview</h3>
          <div className="border border-secondary-200 rounded-lg p-4">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="bg-primary-100 p-3 rounded-full">
                  <MessageSquare className="h-5 w-5 text-primary-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-lg font-semibold text-secondary-900">
                    {discussionData.title}
                    {discussionData.pinned && (
                      <Pin className="h-4 w-4 text-yellow-500 inline ml-2" />
                    )}
                  </h4>
                </div>
                <p className="text-secondary-700 mb-3">{discussionData.content}</p>
                <div className="flex items-center space-x-4 text-sm text-secondary-600">
                  <span>By {discussionData.anonymous ? 'Anonymous' : user?.name}</span>
                  <span>Just now</span>
                  {discussionData.courseId && (
                    <span>
                      in {availableCourses.find(c => c.id === parseInt(discussionData.courseId))?.title}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateDiscussion;
