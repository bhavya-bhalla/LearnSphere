import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Users,
  BookOpen,
  TrendingUp,
  BarChart3,
  Shield,
  AlertCircle,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  GraduationCap,
  FileText,
  X,
  Mail,
  Phone,
  Calendar,
  Award,
  Settings,
  Activity,
  Database,
  Server,
  Wifi,
  HardDrive,
  Cpu,
  Monitor,
  Globe,
  Lock,
  Unlock,
  UserPlus,
  UserMinus,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { eventBus, EVENTS } from '../../utils/eventBus';
import { mockUsers, mockCourses } from '../../utils/mockData';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [pendingCourses, setPendingCourses] = useState([]);
  const [pendingEnrollments, setPendingEnrollments] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    loadData();
    
    // Listen for real-time updates
    const handleCourseCreated = () => loadData();
    const handleEnrollmentRequested = () => loadData();
    
    eventBus.on(EVENTS.COURSE_CREATED, handleCourseCreated);
    eventBus.on(EVENTS.ENROLLMENT_REQUESTED, handleEnrollmentRequested);
    
    return () => {
      eventBus.off(EVENTS.COURSE_CREATED, handleCourseCreated);
      eventBus.off(EVENTS.ENROLLMENT_REQUESTED, handleEnrollmentRequested);
    };
  }, []);

  const loadData = () => {
    // Load users
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const allUsers = [...mockUsers, ...storedUsers];
    setUsers(allUsers);
    setInstructors(allUsers.filter(user => user.role === 'instructor'));

    // Load courses
    const storedCourses = JSON.parse(localStorage.getItem('courses') || '[]');
    const allCourses = [...mockCourses, ...storedCourses];
    setCourses(allCourses);

    // Load pending courses
    const pending = JSON.parse(localStorage.getItem('pendingCourses') || '[]');
    setPendingCourses(pending);

    // Load pending enrollments
    const pendingEnroll = JSON.parse(localStorage.getItem('pendingEnrollments') || '[]');
    setPendingEnrollments(pendingEnroll);
  };

  const handleApproveCourse = (courseId) => {
    const pendingCourses = JSON.parse(localStorage.getItem('pendingCourses') || '[]');
    const courseToApprove = pendingCourses.find(course => course.id === courseId);
    
    if (courseToApprove) {
      // Move course to approved courses with active status
      const approvedCourse = {
        ...courseToApprove,
        status: 'active',
        approvedAt: new Date().toISOString(),
        approvedBy: user?.name,
      };
      
      // Add to main courses list
      const existingCourses = JSON.parse(localStorage.getItem('courses') || '[]');
      existingCourses.push(approvedCourse);
      localStorage.setItem('courses', JSON.stringify(existingCourses));
      
      // Remove from pending courses
      const updatedPendingCourses = pendingCourses.filter(course => course.id !== courseId);
      localStorage.setItem('pendingCourses', JSON.stringify(updatedPendingCourses));
      
      // Update state
      setCourses(prev => [...prev, approvedCourse]);
      setPendingCourses(updatedPendingCourses);
      
      // Emit event for real-time updates
      eventBus.emit(EVENTS.COURSE_APPROVED, approvedCourse);
      
      toast.success(`Course "${courseToApprove.title}" approved successfully!`);
    }
  };

  const handleRejectCourse = (courseId) => {
    if (window.confirm('Are you sure you want to reject this course?')) {
      const pendingCourses = JSON.parse(localStorage.getItem('pendingCourses') || '[]');
      const courseToReject = pendingCourses.find(course => course.id === courseId);
      
      if (courseToReject) {
        // Update course status to rejected
        const rejectedCourse = {
          ...courseToReject,
          status: 'rejected',
          rejectedAt: new Date().toISOString(),
          rejectedBy: user?.name,
        };
        
        // Keep in pending courses but mark as rejected
        const updatedPendingCourses = pendingCourses.map(course => 
          course.id === courseId ? rejectedCourse : course
        );
        localStorage.setItem('pendingCourses', JSON.stringify(updatedPendingCourses));
        
        setPendingCourses(updatedPendingCourses);
        toast.success(`Course "${courseToReject.title}" rejected.`);
      }
    }
  };

  const handleApproveEnrollment = (enrollmentId) => {
    const pendingEnrollments = JSON.parse(localStorage.getItem('pendingEnrollments') || '[]');
    const enrollmentToApprove = pendingEnrollments.find(enrollment => enrollment.id === enrollmentId);
    
    if (enrollmentToApprove) {
      // Add to approved enrollments
      const approvedEnrollments = JSON.parse(localStorage.getItem('approvedEnrollments') || '[]');
      const approvedEnrollment = {
        ...enrollmentToApprove,
        status: 'approved',
        approvedAt: new Date().toISOString(),
        approvedBy: user?.name,
      };
      approvedEnrollments.push(approvedEnrollment);
      localStorage.setItem('approvedEnrollments', JSON.stringify(approvedEnrollments));
      
      // Remove from pending enrollments
      const updatedPendingEnrollments = pendingEnrollments.filter(enrollment => enrollment.id !== enrollmentId);
      localStorage.setItem('pendingEnrollments', JSON.stringify(updatedPendingEnrollments));
      
      setPendingEnrollments(updatedPendingEnrollments);
      
      // Emit event for real-time updates
      eventBus.emit(EVENTS.ENROLLMENT_APPROVED, approvedEnrollment);
      
      toast.success(`Enrollment approved for ${enrollmentToApprove.studentName}!`);
    }
  };

  const handleRejectEnrollment = (enrollmentId) => {
    if (window.confirm('Are you sure you want to reject this enrollment request?')) {
      const pendingEnrollments = JSON.parse(localStorage.getItem('pendingEnrollments') || '[]');
      const enrollmentToReject = pendingEnrollments.find(enrollment => enrollment.id === enrollmentId);
      
      if (enrollmentToReject) {
        // Remove from pending enrollments
        const updatedPendingEnrollments = pendingEnrollments.filter(enrollment => enrollment.id !== enrollmentId);
        localStorage.setItem('pendingEnrollments', JSON.stringify(updatedPendingEnrollments));
        
        setPendingEnrollments(updatedPendingEnrollments);
        toast.success(`Enrollment rejected for ${enrollmentToReject.studentName}.`);
      }
    }
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUsers = storedUsers.filter(user => user.id !== userId);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      
      setUsers(prev => prev.filter(user => user.id !== userId));
      toast.success('User deleted successfully');
    }
  };

  const handleDeleteCourse = (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      const storedCourses = JSON.parse(localStorage.getItem('courses') || '[]');
      const updatedCourses = storedCourses.filter(course => course.id !== courseId);
      localStorage.setItem('courses', JSON.stringify(updatedCourses));
      
      setCourses(prev => prev.filter(course => course.id !== courseId));
      toast.success('Course deleted successfully');
    }
  };

  const exportData = (type) => {
    let data = [];
    let filename = '';
    
    switch (type) {
      case 'users':
        data = users.map(user => [
          user.name,
          user.email,
          user.role,
          user.status,
          new Date(user.joinDate).toLocaleDateString()
        ]);
        data.unshift(['Name', 'Email', 'Role', 'Status', 'Join Date']);
        filename = 'users.csv';
        break;
      case 'courses':
        data = courses.map(course => [
          course.title,
          course.instructor,
          course.category,
          course.level,
          course.enrolledStudents,
          course.status
        ]);
        data.unshift(['Title', 'Instructor', 'Category', 'Level', 'Students', 'Status']);
        filename = 'courses.csv';
        break;
      case 'instructors':
        data = instructors.map(instructor => [
          instructor.name,
          instructor.email,
          instructor.department || 'N/A',
          instructor.coursesTeaching?.length || 0,
          new Date(instructor.joinDate).toLocaleDateString()
        ]);
        data.unshift(['Name', 'Email', 'Department', 'Courses Teaching', 'Join Date']);
        filename = 'instructors.csv';
        break;
    }
    
    const csvContent = data.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStats = () => {
    const totalUsers = users.length;
    const totalCourses = courses.length + pendingCourses.length;
    const activeUsers = users.filter(u => u.status === 'active').length;
    const pendingApprovals = pendingCourses.filter(c => c.status === 'pending').length + pendingEnrollments.length;
    
    return {
      totalUsers,
      totalCourses,
      activeUsers,
      pendingApprovals,
    };
  };

  const stats = getStats();

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInstructors = instructors.filter(instructor =>
    instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    instructor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'courses', label: 'Course Management', icon: BookOpen },
    { id: 'instructors', label: 'Instructor Management', icon: GraduationCap },
    { id: 'approvals', label: 'Pending Approvals', icon: Clock },
    { id: 'analytics', label: 'System Analytics', icon: TrendingUp },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3">
          <Shield className="h-8 w-8 text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Admin Dashboard</h1>
            <p className="text-secondary-600">Manage users, courses, and system settings</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-secondary-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Total Users</p>
              <p className="text-2xl font-bold text-secondary-900">{stats.totalUsers}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-secondary-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Total Courses</p>
              <p className="text-2xl font-bold text-secondary-900">{stats.totalCourses}</p>
            </div>
            <BookOpen className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-secondary-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Active Users</p>
              <p className="text-2xl font-bold text-secondary-900">{stats.activeUsers}</p>
            </div>
            <UserCheck className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-secondary-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Pending Approvals</p>
              <p className="text-2xl font-bold text-secondary-900">{stats.pendingApprovals}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-600" />
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
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-secondary-600 hover:text-secondary-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  {tab.id === 'approvals' && stats.pendingApprovals > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
                      {stats.pendingApprovals}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-secondary-900">System Overview</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-secondary-900">Recent Activity</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-secondary-50 rounded-lg">
                      <UserPlus className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-secondary-900">New user registered</p>
                        <p className="text-xs text-secondary-600">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-secondary-50 rounded-lg">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-secondary-900">Course submitted for approval</p>
                        <p className="text-xs text-secondary-600">4 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-secondary-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-secondary-900">Course approved</p>
                        <p className="text-xs text-secondary-600">1 day ago</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-secondary-900">Quick Actions</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setActiveTab('users')}
                      className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-left transition-colors"
                    >
                      <Users className="h-6 w-6 text-blue-600 mb-2" />
                      <p className="font-medium text-blue-900">Manage Users</p>
                    </button>
                    <button
                      onClick={() => setActiveTab('courses')}
                      className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-left transition-colors"
                    >
                      <BookOpen className="h-6 w-6 text-green-600 mb-2" />
                      <p className="font-medium text-green-900">Manage Courses</p>
                    </button>
                    <button
                      onClick={() => setActiveTab('approvals')}
                      className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg text-left transition-colors"
                    >
                      <Clock className="h-6 w-6 text-orange-600 mb-2" />
                      <p className="font-medium text-orange-900">Pending Approvals</p>
                    </button>
                    <button
                      onClick={() => setActiveTab('analytics')}
                      className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-left transition-colors"
                    >
                      <BarChart3 className="h-6 w-6 text-purple-600 mb-2" />
                      <p className="font-medium text-purple-900">View Analytics</p>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* User Management Tab */}
          {activeTab === 'users' && (
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
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="input-field"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="instructor">Instructor</option>
                  <option value="student">Student</option>
                </select>
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
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-secondary-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={user.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150'}
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
                            user.role === 'admin' ? 'bg-red-100 text-red-800' :
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
                            <button
                              onClick={() => setSelectedUser(user)}
                              className="p-1 text-blue-600 hover:text-blue-700"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="p-1 text-secondary-600 hover:text-secondary-700">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-1 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
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

          {/* Course Management Tab */}
          {activeTab === 'courses' && (
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <div key={course.id} className="bg-white rounded-xl shadow-sm border border-secondary-200 overflow-hidden">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-32 object-cover"
                    />
                    <div className="p-4">
                      <h4 className="font-semibold text-secondary-900 mb-2">{course.title}</h4>
                      <p className="text-sm text-secondary-600 mb-2">by {course.instructor}</p>
                      <div className="flex items-center justify-between text-sm text-secondary-500 mb-3">
                        <span>{course.category}</span>
                        <span>{course.level}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm mb-3">
                        <span className="text-secondary-600">{course.enrolledStudents} students</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          course.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {course.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedCourse(course)}
                          className="flex-1 btn-primary text-sm py-2"
                        >
                          <Eye className="h-4 w-4 inline mr-1" />
                          View
                        </button>
                        <button className="btn-secondary text-sm py-2 px-3">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(course.id)}
                          className="p-2 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructor Management Tab */}
          {activeTab === 'instructors' && (
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredInstructors.map((instructor) => (
                  <div key={instructor.id} className="bg-white rounded-xl shadow-sm border border-secondary-200 p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <img
                        src={instructor.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150'}
                        alt={instructor.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-semibold text-secondary-900">{instructor.name}</h4>
                        <p className="text-sm text-secondary-600">{instructor.email}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-secondary-600">Department:</span>
                        <span className="text-secondary-900">{instructor.department || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary-600">Courses:</span>
                        <span className="text-secondary-900">{instructor.coursesTeaching?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-secondary-600">Join Date:</span>
                        <span className="text-secondary-900">{new Date(instructor.joinDate).toLocaleDateString()}</span>
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

                    <div className="flex items-center space-x-2 mt-4">
                      <button className="flex-1 btn-primary text-sm py-2">
                        <Eye className="h-4 w-4 inline mr-1" />
                        View Profile
                      </button>
                      <button className="btn-secondary text-sm py-2 px-3">
                        <Mail className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Approvals Tab */}
          {activeTab === 'approvals' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-secondary-900">Pending Approvals</h3>
              
              {/* Pending Courses */}
              <div>
                <h4 className="font-medium text-secondary-900 mb-4">Course Approvals ({pendingCourses.filter(c => c.status === 'pending').length})</h4>
                <div className="space-y-4">
                  {pendingCourses.filter(course => course.status === 'pending').map((course) => (
                    <div key={course.id} className="bg-white rounded-xl p-6 shadow-sm border border-secondary-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-semibold text-secondary-900 mb-2">{course.title}</h5>
                          <p className="text-secondary-600 mb-2">{course.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-secondary-500">
                            <span>by {course.instructor}</span>
                            <span>{course.category}</span>
                            <span>{course.level}</span>
                            <span>Submitted: {new Date(course.submittedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => handleApproveCourse(course.id)}
                            className="btn-primary flex items-center space-x-1"
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleRejectCourse(course.id)}
                            className="btn-secondary flex items-center space-x-1 text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {pendingCourses.filter(c => c.status === 'pending').length === 0 && (
                    <p className="text-secondary-600 text-center py-8">No pending course approvals</p>
                  )}
                </div>
              </div>

              {/* Pending Enrollments */}
              <div>
                <h4 className="font-medium text-secondary-900 mb-4">Enrollment Approvals ({pendingEnrollments.length})</h4>
                <div className="space-y-4">
                  {pendingEnrollments.map((enrollment) => (
                    <div key={enrollment.id} className="bg-white rounded-xl p-6 shadow-sm border border-secondary-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <img
                            src={enrollment.studentAvatar}
                            alt={enrollment.studentName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <h5 className="font-medium text-secondary-900">{enrollment.studentName}</h5>
                            <p className="text-sm text-secondary-600">{enrollment.studentEmail}</p>
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="font-medium text-secondary-900">{enrollment.courseName}</p>
                          <p className="text-sm text-secondary-600">
                            Requested: {new Date(enrollment.requestedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleApproveEnrollment(enrollment.id)}
                            className="btn-primary flex items-center space-x-1"
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleRejectEnrollment(enrollment.id)}
                            className="btn-secondary flex items-center space-x-1 text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {pendingEnrollments.length === 0 && (
                    <p className="text-secondary-600 text-center py-8">No pending enrollment requests</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* System Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-secondary-900">System Analytics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-secondary-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-secondary-600">User Growth</p>
                      <p className="text-2xl font-bold text-secondary-900">+12%</p>
                      <p className="text-xs text-green-600">This month</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-secondary-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-secondary-600">Course Completion</p>
                      <p className="text-2xl font-bold text-secondary-900">78%</p>
                      <p className="text-xs text-blue-600">Average rate</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-blue-600" />
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-secondary-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-secondary-600">Active Sessions</p>
                      <p className="text-2xl font-bold text-secondary-900">234</p>
                      <p className="text-xs text-purple-600">Current users</p>
                    </div>
                    <Activity className="h-8 w-8 text-purple-600" />
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-secondary-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-secondary-600">System Uptime</p>
                      <p className="text-2xl font-bold text-secondary-900">99.9%</p>
                      <p className="text-xs text-green-600">Last 30 days</p>
                    </div>
                    <Server className="h-8 w-8 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-secondary-200">
                  <h4 className="font-medium text-secondary-900 mb-4">System Health</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Cpu className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-secondary-700">CPU Usage</span>
                      </div>
                      <span className="text-sm font-medium text-secondary-900">45%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <HardDrive className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-secondary-700">Memory Usage</span>
                      </div>
                      <span className="text-sm font-medium text-secondary-900">62%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Database className="h-4 w-4 text-purple-600" />
                        <span className="text-sm text-secondary-700">Database</span>
                      </div>
                      <span className="text-sm font-medium text-green-600">Healthy</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Wifi className="h-4 w-4 text-orange-600" />
                        <span className="text-sm text-secondary-700">Network</span>
                      </div>
                      <span className="text-sm font-medium text-green-600">Stable</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-secondary-200">
                  <h4 className="font-medium text-secondary-900 mb-4">Recent Alerts</h4>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-green-900">System backup completed</p>
                        <p className="text-xs text-green-700">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                      <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-900">High memory usage detected</p>
                        <p className="text-xs text-yellow-700">6 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                      <RefreshCw className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">System update available</p>
                        <p className="text-xs text-blue-700">1 day ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-secondary-900">Reports</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-secondary-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div>
                      <h4 className="font-semibold text-secondary-900">User Activity Report</h4>
                      <p className="text-sm text-secondary-600">User engagement and activity metrics</p>
                    </div>
                  </div>
                  <button className="btn-primary w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </button>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-secondary-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <BookOpen className="h-8 w-8 text-green-600" />
                    <div>
                      <h4 className="font-semibold text-secondary-900">Course Performance</h4>
                      <p className="text-sm text-secondary-600">Course completion and engagement rates</p>
                    </div>
                  </div>
                  <button className="btn-primary w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </button>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-secondary-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <GraduationCap className="h-8 w-8 text-purple-600" />
                    <div>
                      <h4 className="font-semibold text-secondary-900">Instructor Report</h4>
                      <p className="text-sm text-secondary-600">Instructor performance and statistics</p>
                    </div>
                  </div>
                  <button className="btn-primary w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </button>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-secondary-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <BarChart3 className="h-8 w-8 text-orange-600" />
                    <div>
                      <h4 className="font-semibold text-secondary-900">System Analytics</h4>
                      <p className="text-sm text-secondary-600">Platform usage and performance metrics</p>
                    </div>
                  </div>
                  <button className="btn-primary w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </button>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-secondary-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <FileText className="h-8 w-8 text-red-600" />
                    <div>
                      <h4 className="font-semibold text-secondary-900">Custom Report</h4>
                      <p className="text-sm text-secondary-600">Create custom reports with specific metrics</p>
                    </div>
                  </div>
                  <button className="btn-primary w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Custom
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-secondary-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-secondary-900">User Details</h3>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-secondary-400 hover:text-secondary-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-6">
                <img
                  src={selectedUser.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150'}
                  alt={selectedUser.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h4 className="text-xl font-semibold text-secondary-900">{selectedUser.name}</h4>
                  <p className="text-secondary-600">{selectedUser.email}</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                    selectedUser.role === 'admin' ? 'bg-red-100 text-red-800' :
                    selectedUser.role === 'instructor' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {selectedUser.role}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-secondary-600">Status</div>
                  <div className="font-medium text-secondary-900">{selectedUser.status}</div>
                </div>
                <div>
                  <div className="text-sm text-secondary-600">Join Date</div>
                  <div className="font-medium text-secondary-900">
                    {new Date(selectedUser.joinDate).toLocaleDateString()}
                  </div>
                </div>
                {selectedUser.department && (
                  <div>
                    <div className="text-sm text-secondary-600">Department</div>
                    <div className="font-medium text-secondary-900">{selectedUser.department}</div>
                  </div>
                )}
                {selectedUser.major && (
                  <div>
                    <div className="text-sm text-secondary-600">Major</div>
                    <div className="font-medium text-secondary-900">{selectedUser.major}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Course Detail Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-secondary-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-secondary-900">Course Details</h3>
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="text-secondary-400 hover:text-secondary-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex space-x-6">
                <img
                  src={selectedCourse.image}
                  alt={selectedCourse.title}
                  className="w-32 h-32 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h4 className="text-xl font-semibold text-secondary-900 mb-2">{selectedCourse.title}</h4>
                  <p className="text-secondary-600 mb-4">{selectedCourse.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-secondary-600">Instructor</div>
                      <div className="font-medium text-secondary-900">{selectedCourse.instructor}</div>
                    </div>
                    <div>
                      <div className="text-sm text-secondary-600">Category</div>
                      <div className="font-medium text-secondary-900">{selectedCourse.category}</div>
                    </div>
                    <div>
                      <div className="text-sm text-secondary-600">Level</div>
                      <div className="font-medium text-secondary-900">{selectedCourse.level}</div>
                    </div>
                    <div>
                      <div className="text-sm text-secondary-600">Duration</div>
                      <div className="font-medium text-secondary-900">{selectedCourse.duration}</div>
                    </div>
                    <div>
                      <div className="text-sm text-secondary-600">Students</div>
                      <div className="font-medium text-secondary-900">
                        {selectedCourse.enrolledStudents}/{selectedCourse.maxStudents}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-secondary-600">Status</div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedCourse.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedCourse.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
