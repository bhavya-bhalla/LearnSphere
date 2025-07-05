import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Users,
  BookOpen,
  TrendingUp,
  Shield,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  UserCheck,
  UserX,
  GraduationCap,
  BarChart3,
  Calendar,
  MessageSquare,
  FileText,
  Settings,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Plus,
  Mail,
  Phone,
  Award,
} from 'lucide-react';
import { mockUsers, mockCourses } from '../../utils/mockData';
import { eventBus, EVENTS } from '../../utils/eventBus';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [pendingCourses, setPendingCourses] = useState([]);
  const [pendingEnrollments, setPendingEnrollments] = useState([]);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadAdminData();

    // Listen for real-time updates
    const handleCourseCreated = () => {
      loadAdminData();
    };

    const handleEnrollmentRequested = () => {
      loadAdminData();
    };

    eventBus.on(EVENTS.COURSE_CREATED, handleCourseCreated);
    eventBus.on(EVENTS.ENROLLMENT_REQUESTED, handleEnrollmentRequested);

    return () => {
      eventBus.off(EVENTS.COURSE_CREATED, handleCourseCreated);
      eventBus.off(EVENTS.ENROLLMENT_REQUESTED, handleEnrollmentRequested);
    };
  }, []);

  const loadAdminData = () => {
    // Load pending courses from localStorage
    const storedPendingCourses = JSON.parse(localStorage.getItem('pendingCourses') || '[]');
    setPendingCourses(storedPendingCourses);

    // Load pending enrollments from localStorage
    const storedPendingEnrollments = JSON.parse(localStorage.getItem('pendingEnrollments') || '[]');
    setPendingEnrollments(storedPendingEnrollments);

    // Load all users and courses
    setUsers(mockUsers);
    setCourses([...mockCourses, ...JSON.parse(localStorage.getItem('courses') || '[]')]);
    
    // Load instructors
    const allInstructors = mockUsers.filter(u => u.role === 'instructor');
    setInstructors(allInstructors);
  };

  const handleCourseApproval = (courseId, approved) => {
    const course = pendingCourses.find(c => c.id === courseId);
    if (!course) return;

    if (approved) {
      // Move course to approved courses
      const approvedCourse = {
        ...course,
        status: 'active',
        approvedAt: new Date().toISOString(),
        approvedBy: user?.name,
      };

      const existingCourses = JSON.parse(localStorage.getItem('courses') || '[]');
      existingCourses.push(approvedCourse);
      localStorage.setItem('courses', JSON.stringify(existingCourses));

      // Emit event for real-time updates
      eventBus.emit(EVENTS.COURSE_APPROVED, approvedCourse);

      toast.success(`Course "${course.title}" has been approved!`);
    } else {
      // Reject course
      const rejectedCourse = {
        ...course,
        status: 'rejected',
        rejectedAt: new Date().toISOString(),
        rejectedBy: user?.name,
      };

      const rejectedCourses = JSON.parse(localStorage.getItem('rejectedCourses') || '[]');
      rejectedCourses.push(rejectedCourse);
      localStorage.setItem('rejectedCourses', JSON.stringify(rejectedCourses));

      toast.error(`Course "${course.title}" has been rejected.`);
    }

    // Remove from pending courses
    const updatedPendingCourses = pendingCourses.filter(c => c.id !== courseId);
    setPendingCourses(updatedPendingCourses);
    localStorage.setItem('pendingCourses', JSON.stringify(updatedPendingCourses));
  };

  const handleEnrollmentApproval = (enrollmentId, approved) => {
    const enrollment = pendingEnrollments.find(e => e.id === enrollmentId);
    if (!enrollment) return;

    if (approved) {
      // Approve enrollment
      const approvedEnrollments = JSON.parse(localStorage.getItem('approvedEnrollments') || '[]');
      approvedEnrollments.push({
        ...enrollment,
        status: 'approved',
        approvedAt: new Date().toISOString(),
        approvedBy: user?.name,
      });
      localStorage.setItem('approvedEnrollments', JSON.stringify(approvedEnrollments));

      // Emit event for real-time updates
      eventBus.emit(EVENTS.ENROLLMENT_APPROVED, enrollment);

      toast.success(`Enrollment for ${enrollment.studentName} has been approved!`);
    } else {
      // Reject enrollment
      const rejectedEnrollments = JSON.parse(localStorage.getItem('rejectedEnrollments') || '[]');
      rejectedEnrollments.push({
        ...enrollment,
        status: 'rejected',
        rejectedAt: new Date().toISOString(),
        rejectedBy: user?.name,
      });
      localStorage.setItem('rejectedEnrollments', JSON.stringify(rejectedEnrollments));

      toast.error(`Enrollment for ${enrollment.studentName} has been rejected.`);
    }

    // Remove from pending enrollments
    const updatedPendingEnrollments = pendingEnrollments.filter(e => e.id !== enrollmentId);
    setPendingEnrollments(updatedPendingEnrollments);
    localStorage.setItem('pendingEnrollments', JSON.stringify(updatedPendingEnrollments));
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      // In a real app, this would call an API
      toast.success('User deleted successfully');
    }
  };

  const handleDeleteCourse = (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      const updatedCourses = courses.filter(c => c.id !== courseId);
      setCourses(updatedCourses);
      
      // Update localStorage
      const storedCourses = JSON.parse(localStorage.getItem('courses') || '[]');
      const updatedStoredCourses = storedCourses.filter(c => c.id !== courseId);
      localStorage.setItem('courses', JSON.stringify(updatedStoredCourses));
      
      toast.success('Course deleted successfully');
    }
  };

  const exportData = (type) => {
    let csvContent = '';
    let filename = '';

    switch (type) {
      case 'users':
        csvContent = [
          ['Name', 'Email', 'Role', 'Status', 'Join Date'],
          ...users.map(u => [u.name, u.email, u.role, u.status, u.joinDate])
        ].map(row => row.join(',')).join('\n');
        filename = 'users_report.csv';
        break;
      case 'courses':
        csvContent = [
          ['Title', 'Instructor', 'Category', 'Level', 'Enrolled Students', 'Status'],
          ...courses.map(c => [c.title, c.instructor, c.category, c.level, c.enrolledStudents || 0, c.status || 'active'])
        ].map(row => row.join(',')).join('\n');
        filename = 'courses_report.csv';
        break;
      case 'instructors':
        csvContent = [
          ['Name', 'Email', 'Department', 'Courses Teaching', 'Join Date'],
          ...instructors.map(i => [i.name, i.email, i.department || 'N/A', i.coursesTeaching?.length || 0, i.joinDate])
        ].map(row => row.join(',')).join('\n');
        filename = 'instructors_report.csv';
        break;
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getSystemStats = () => {
    const totalUsers = users.length;
    const totalInstructors = users.filter(u => u.role === 'instructor').length;
    const totalStudents = users.filter(u => u.role === 'student').length;
    const totalCourses = courses.length;
    const activeCourses = courses.filter(c => c.status === 'active').length;
    const pendingCoursesCount = pendingCourses.length;
    const pendingEnrollmentsCount = pendingEnrollments.length;

    return {
      totalUsers,
      totalInstructors,
      totalStudents,
      totalCourses,
      activeCourses,
      pendingCoursesCount,
      pendingEnrollmentsCount,
    };
  };

  const stats = getSystemStats();

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'pending-courses', label: 'Pending Courses', icon: BookOpen, badge: stats.pendingCoursesCount },
    { id: 'pending-enrollments', label: 'Pending Enrollments', icon: UserCheck, badge: stats.pendingEnrollmentsCount },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'courses', label: 'Course Management', icon: GraduationCap },
    { id: 'instructors', label: 'Instructor Management', icon: Shield },
    { id: 'analytics', label: 'System Analytics', icon: TrendingUp },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || user.role === filterType;
    return matchesSearch && matchesFilter;
  });

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || course.status === filterType;
    return matchesSearch && matchesFilter;
  });

  const filteredInstructors = instructors.filter(instructor => {
    const matchesSearch = instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         instructor.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Admin Dashboard</h1>
          <p className="text-secondary-600 mt-1">
            Manage users, courses, and system settings
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-primary-600" />
          <span className="text-sm font-medium text-primary-600">Administrator</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-secondary-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Total Users</p>
              <p className="text-2xl font-bold text-secondary-900">{stats.totalUsers}</p>
              <p className="text-xs text-secondary-500">{stats.totalInstructors} instructors, {stats.totalStudents} students</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-secondary-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Total Courses</p>
              <p className="text-2xl font-bold text-secondary-900">{stats.totalCourses}</p>
              <p className="text-xs text-secondary-500">{stats.activeCourses} active courses</p>
            </div>
            <BookOpen className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-secondary-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Pending Approvals</p>
              <p className="text-2xl font-bold text-secondary-900">{stats.pendingCoursesCount + stats.pendingEnrollmentsCount}</p>
              <p className="text-xs text-secondary-500">{stats.pendingCoursesCount} courses, {stats.pendingEnrollmentsCount} enrollments</p>
            </div>
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-secondary-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">System Health</p>
              <p className="text-2xl font-bold text-secondary-900">99.9%</p>
              <p className="text-xs text-secondary-500">All systems operational</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-secondary-200">
        <div className="border-b border-secondary-200">
          <nav className="flex space-x-8 px-6 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors duration-200 whitespace-nowrap ${
                    selectedTab === tab.id
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-secondary-600 hover:text-secondary-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  {tab.badge > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {selectedTab === 'overview' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-secondary-900">System Overview</h3>
              
              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-secondary-900">Recent Course Submissions</h4>
                  {pendingCourses.slice(0, 3).map(course => (
                    <div key={course.id} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                      <div>
                        <div className="font-medium text-secondary-900">{course.title}</div>
                        <div className="text-sm text-secondary-600">by {course.instructor}</div>
                      </div>
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                        Pending
                      </span>
                    </div>
                  ))}
                  {pendingCourses.length === 0 && (
                    <p className="text-secondary-600 text-sm">No pending course submissions</p>
                  )}
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-secondary-900">Recent Enrollment Requests</h4>
                  {pendingEnrollments.slice(0, 3).map(enrollment => (
                    <div key={enrollment.id} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                      <div>
                        <div className="font-medium text-secondary-900">{enrollment.studentName}</div>
                        <div className="text-sm text-secondary-600">{enrollment.courseName}</div>
                      </div>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                        Pending
                      </span>
                    </div>
                  ))}
                  {pendingEnrollments.length === 0 && (
                    <p className="text-secondary-600 text-sm">No pending enrollment requests</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Pending Courses Tab */}
          {selectedTab === 'pending-courses' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-secondary-900">Pending Course Approvals</h3>
              
              {pendingCourses.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-secondary-900 mb-2">No Pending Courses</h4>
                  <p className="text-secondary-600">All course submissions have been reviewed.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingCourses.map(course => (
                    <div key={course.id} className="border border-secondary-200 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-secondary-900 mb-2">{course.title}</h4>
                          <p className="text-secondary-600 mb-3">{course.description}</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-secondary-600">Instructor:</span>
                              <div className="font-medium">{course.instructor}</div>
                            </div>
                            <div>
                              <span className="text-secondary-600">Category:</span>
                              <div className="font-medium">{course.category}</div>
                            </div>
                            <div>
                              <span className="text-secondary-600">Level:</span>
                              <div className="font-medium">{course.level}</div>
                            </div>
                            <div>
                              <span className="text-secondary-600">Duration:</span>
                              <div className="font-medium">{course.duration}</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleCourseApproval(course.id, true)}
                            className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleCourseApproval(course.id, false)}
                            className="flex items-center space-x-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <XCircle className="h-4 w-4" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                      
                      <div className="text-xs text-secondary-500">
                        Submitted on {new Date(course.submittedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Pending Enrollments Tab */}
          {selectedTab === 'pending-enrollments' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-secondary-900">Pending Enrollment Requests</h3>
              
              {pendingEnrollments.length === 0 ? (
                <div className="text-center py-8">
                  <UserCheck className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-secondary-900 mb-2">No Pending Enrollments</h4>
                  <p className="text-secondary-600">All enrollment requests have been reviewed.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingEnrollments.map(enrollment => (
                    <div key={enrollment.id} className="border border-secondary-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <img
                              src={enrollment.studentAvatar}
                              alt={enrollment.studentName}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                            <div>
                              <h4 className="font-semibold text-secondary-900">{enrollment.studentName}</h4>
                              <p className="text-sm text-secondary-600">{enrollment.studentEmail}</p>
                              <p className="text-sm text-secondary-600">Course: {enrollment.courseName}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEnrollmentApproval(enrollment.id, true)}
                            className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleEnrollmentApproval(enrollment.id, false)}
                            className="flex items-center space-x-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <XCircle className="h-4 w-4" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                      
                      <div className="text-xs text-secondary-500 mt-2">
                        Requested on {new Date(enrollment.requestedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Users Tab */}
          {selectedTab === 'users' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-secondary-900">User Management</h3>
                <button
                  onClick={() => exportData('users')}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Export Users</span>
                </button>
              </div>

              {/* Search and Filter */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field pl-10"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 h-4 w-4" />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="input-field pl-10 appearance-none"
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Admins</option>
                    <option value="instructor">Instructors</option>
                    <option value="student">Students</option>
                  </select>
                </div>
                <div className="flex items-center text-sm text-secondary-600">
                  <span>{filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary-50 border-b border-secondary-200">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-secondary-900">User</th>
                      <th className="text-left py-3 px-4 font-medium text-secondary-900">Role</th>
                      <th className="text-left py-3 px-4 font-medium text-secondary-900">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-secondary-900">Join Date</th>
                      <th className="text-left py-3 px-4 font-medium text-secondary-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary-200">
                    {filteredUsers.map(user => (
                      <tr key={user.id} className="hover:bg-secondary-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <div>
                              <div className="font-medium text-secondary-900">{user.name}</div>
                              <div className="text-sm text-secondary-600">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                            user.role === 'instructor' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-secondary-600">
                          {new Date(user.joinDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                              <Eye className="h-4 w-4 inline mr-1" />
                              View
                            </button>
                            <button className="text-secondary-600 hover:text-secondary-700 text-sm font-medium">
                              <Edit className="h-4 w-4 inline mr-1" />
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 hover:text-red-700 text-sm font-medium"
                            >
                              <Trash2 className="h-4 w-4 inline mr-1" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Courses Tab */}
          {selectedTab === 'courses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-secondary-900">Course Management</h3>
                <button
                  onClick={() => exportData('courses')}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Export Courses</span>
                </button>
              </div>

              {/* Search and Filter */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 h-4 w-4" />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="input-field pl-10 appearance-none"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div className="flex items-center text-sm text-secondary-600">
                  <span>{filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map(course => (
                  <div key={course.id} className="border border-secondary-200 rounded-lg p-4">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                    <h4 className="font-semibold text-secondary-900 mb-2">{course.title}</h4>
                    <p className="text-sm text-secondary-600 mb-2">by {course.instructor}</p>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        course.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {course.status || 'active'}
                      </span>
                      <span className="text-sm text-secondary-600">
                        {course.enrolledStudents || 0} students
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                        <Eye className="h-4 w-4 inline mr-1" />
                        View
                      </button>
                      <button className="text-secondary-600 hover:text-secondary-700 text-sm font-medium">
                        <Edit className="h-4 w-4 inline mr-1" />
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteCourse(course.id)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        <Trash2 className="h-4 w-4 inline mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructors Tab */}
          {selectedTab === 'instructors' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-secondary-900">Instructor Management</h3>
                <button
                  onClick={() => exportData('instructors')}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Export Instructors</span>
                </button>
              </div>

              {/* Search */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search instructors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field pl-10"
                  />
                </div>
                <div></div>
                <div className="flex items-center text-sm text-secondary-600">
                  <span>{filteredInstructors.length} instructor{filteredInstructors.length !== 1 ? 's' : ''}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredInstructors.map(instructor => (
                  <div key={instructor.id} className="bg-white border border-secondary-200 rounded-lg p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <img
                        src={instructor.avatar}
                        alt={instructor.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-semibold text-secondary-900">{instructor.name}</h4>
                        <p className="text-sm text-secondary-600">{instructor.email}</p>
                        <p className="text-sm text-secondary-500">{instructor.department || 'Computer Science'}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-secondary-600">Courses Teaching:</span>
                        <span className="font-medium">{instructor.coursesTeaching?.length || 1}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary-600">Join Date:</span>
                        <span>{new Date(instructor.joinDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary-600">Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          instructor.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {instructor.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-secondary-200">
                      <button className="flex-1 btn-primary text-sm py-2">
                        <Eye className="h-4 w-4 inline mr-1" />
                        View Profile
                      </button>
                      <button className="btn-secondary text-sm py-2 px-3">
                        <Mail className="h-4 w-4" />
                      </button>
                      <button className="btn-secondary text-sm py-2 px-3">
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {selectedTab === 'analytics' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-secondary-900">System Analytics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-blue-600 font-medium">User Growth</div>
                      <div className="text-2xl font-bold text-blue-700">+15%</div>
                      <div className="text-xs text-blue-600">This month</div>
                    </div>
                    <TrendingUp className="h-8 w-8 text-blue-600" />
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-green-600 font-medium">Course Completion</div>
                      <div className="text-2xl font-bold text-green-700">78%</div>
                      <div className="text-xs text-green-600">Average rate</div>
                    </div>
                    <Award className="h-8 w-8 text-green-600" />
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-purple-600 font-medium">Active Sessions</div>
                      <div className="text-2xl font-bold text-purple-700">1,234</div>
                      <div className="text-xs text-purple-600">Current users</div>
                    </div>
                    <Users className="h-8 w-8 text-purple-600" />
                  </div>
                </div>

                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-orange-600 font-medium">System Uptime</div>
                      <div className="text-2xl font-bold text-orange-700">99.9%</div>
                      <div className="text-xs text-orange-600">Last 30 days</div>
                    </div>
                    <Shield className="h-8 w-8 text-orange-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-secondary-200 rounded-lg p-6">
                <h4 className="font-medium text-secondary-900 mb-4">Platform Usage Trends</h4>
                <div className="text-center py-8 text-secondary-600">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Analytics charts would be displayed here</p>
                  <p className="text-sm mt-1">Integration with analytics service required</p>
                </div>
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {selectedTab === 'reports' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-secondary-900">System Reports</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white border border-secondary-200 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div>
                      <h4 className="font-semibold text-secondary-900">User Activity Report</h4>
                      <p className="text-sm text-secondary-600">Detailed user engagement metrics</p>
                    </div>
                  </div>
                  <button
                    onClick={() => exportData('users')}
                    className="btn-primary w-full"
                  >
                    <Download className="h-4 w-4 inline mr-2" />
                    Generate Report
                  </button>
                </div>

                <div className="bg-white border border-secondary-200 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <BookOpen className="h-8 w-8 text-green-600" />
                    <div>
                      <h4 className="font-semibold text-secondary-900">Course Performance Report</h4>
                      <p className="text-sm text-secondary-600">Course enrollment and completion data</p>
                    </div>
                  </div>
                  <button
                    onClick={() => exportData('courses')}
                    className="btn-primary w-full"
                  >
                    <Download className="h-4 w-4 inline mr-2" />
                    Generate Report
                  </button>
                </div>

                <div className="bg-white border border-secondary-200 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Shield className="h-8 w-8 text-purple-600" />
                    <div>
                      <h4 className="font-semibold text-secondary-900">Instructor Report</h4>
                      <p className="text-sm text-secondary-600">Instructor performance and statistics</p>
                    </div>
                  </div>
                  <button
                    onClick={() => exportData('instructors')}
                    className="btn-primary w-full"
                  >
                    <Download className="h-4 w-4 inline mr-2" />
                    Generate Report
                  </button>
                </div>

                <div className="bg-white border border-secondary-200 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <TrendingUp className="h-8 w-8 text-orange-600" />
                    <div>
                      <h4 className="font-semibold text-secondary-900">System Analytics Report</h4>
                      <p className="text-sm text-secondary-600">Platform usage and performance metrics</p>
                    </div>
                  </div>
                  <button className="btn-primary w-full">
                    <Download className="h-4 w-4 inline mr-2" />
                    Generate Report
                  </button>
                </div>

                <div className="bg-white border border-secondary-200 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <FileText className="h-8 w-8 text-red-600" />
                    <div>
                      <h4 className="font-semibold text-secondary-900">Financial Report</h4>
                      <p className="text-sm text-secondary-600">Revenue and financial analytics</p>
                    </div>
                  </div>
                  <button className="btn-primary w-full">
                    <Download className="h-4 w-4 inline mr-2" />
                    Generate Report
                  </button>
                </div>

                <div className="bg-white border border-secondary-200 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Calendar className="h-8 w-8 text-indigo-600" />
                    <div>
                      <h4 className="font-semibold text-secondary-900">Custom Report</h4>
                      <p className="text-sm text-secondary-600">Create custom reports with specific criteria</p>
                    </div>
                  </div>
                  <button className="btn-primary w-full">
                    <Plus className="h-4 w-4 inline mr-2" />
                    Create Custom
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* System Settings Tab */}
          {selectedTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-secondary-900">System Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-secondary-900">Course Approval Settings</h4>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      Require admin approval for new courses
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      Require admin approval for enrollments
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      Auto-approve courses from verified instructors
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-secondary-900">Notification Settings</h4>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      Email notifications for pending approvals
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      Daily admin reports
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      Weekly system health reports
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-secondary-900">Assignment Settings</h4>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      Allow late submissions
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      Enable automatic grading
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      Send deadline reminders
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-secondary-900">Security Settings</h4>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      Enable two-factor authentication
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      Log user activities
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      Require strong passwords
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-secondary-200">
                <button className="btn-primary">
                  Save Settings
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
