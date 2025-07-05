import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Bell,
  CheckCircle,
  AlertCircle,
  Info,
  Calendar,
  BookOpen,
  FileText,
  MessageSquare,
  X,
  Settings,
  Filter,
  Users,
  Award,
  Clock,
  TrendingUp,
} from 'lucide-react';

const NotificationCenter = () => {
  const { user } = useSelector((state) => state.auth);
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showSettings, setShowSettings] = useState(false);

  // Role-specific notifications
  const getNotificationsForRole = () => {
    const baseNotifications = [
      {
        id: 1,
        type: 'announcement',
        title: 'Welcome to LearnSphere!',
        message: 'Welcome to our learning management system. Explore courses and start your learning journey.',
        timestamp: '2024-02-15T10:30:00Z',
        read: false,
        priority: 'medium',
        icon: Info,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
      },
      {
        id: 2,
        type: 'system',
        title: 'System Maintenance Scheduled',
        message: 'Scheduled maintenance will occur on Sunday from 2:00 AM to 4:00 AM EST.',
        timestamp: '2024-02-14T15:45:00Z',
        read: true,
        priority: 'high',
        icon: AlertCircle,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
      },
    ];

    if (user?.role === 'student') {
      return [
        ...baseNotifications,
        {
          id: 3,
          type: 'assignment',
          title: 'New Assignment: React Todo App',
          message: 'A new assignment has been posted in Introduction to React course.',
          courseId: 1,
          courseName: 'Introduction to React',
          timestamp: '2024-02-15T10:30:00Z',
          read: false,
          priority: 'high',
          icon: FileText,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
        },
        {
          id: 4,
          type: 'grade',
          title: 'Assignment Graded',
          message: 'Your React Todo App assignment has been graded. Score: 85/100',
          courseId: 1,
          courseName: 'Introduction to React',
          timestamp: '2024-02-14T15:45:00Z',
          read: false,
          priority: 'medium',
          icon: Award,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
        },
        {
          id: 5,
          type: 'discussion',
          title: 'New Reply in Discussion',
          message: 'Dr. Sarah Johnson replied to your question about useState hooks.',
          courseId: 1,
          courseName: 'Introduction to React',
          timestamp: '2024-02-14T09:20:00Z',
          read: true,
          priority: 'low',
          icon: MessageSquare,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
        },
        {
          id: 6,
          type: 'deadline',
          title: 'Assignment Due Soon',
          message: 'Component Library assignment is due in 2 days.',
          courseId: 1,
          courseName: 'Introduction to React',
          timestamp: '2024-02-13T08:00:00Z',
          read: true,
          priority: 'high',
          icon: Clock,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
        },
      ];
    }

    if (user?.role === 'instructor') {
      return [
        ...baseNotifications,
        {
          id: 3,
          type: 'submission',
          title: 'New Assignment Submission',
          message: 'John Smith submitted the React Todo App assignment.',
          courseId: 1,
          courseName: 'Introduction to React',
          timestamp: '2024-02-15T14:30:00Z',
          read: false,
          priority: 'medium',
          icon: FileText,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
        },
        {
          id: 4,
          type: 'enrollment',
          title: 'New Student Enrollment',
          message: 'Jane Doe has enrolled in your Advanced JavaScript course.',
          courseId: 2,
          courseName: 'Advanced JavaScript',
          timestamp: '2024-02-14T11:20:00Z',
          read: false,
          priority: 'low',
          icon: Users,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
        },
        {
          id: 5,
          type: 'discussion',
          title: 'New Discussion Post',
          message: 'A student posted a new question in your React course discussion.',
          courseId: 1,
          courseName: 'Introduction to React',
          timestamp: '2024-02-13T16:45:00Z',
          read: true,
          priority: 'medium',
          icon: MessageSquare,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
        },
        {
          id: 6,
          type: 'analytics',
          title: 'Course Performance Update',
          message: 'Your React course has achieved 90% completion rate this month.',
          courseId: 1,
          courseName: 'Introduction to React',
          timestamp: '2024-02-12T09:00:00Z',
          read: true,
          priority: 'low',
          icon: TrendingUp,
          color: 'text-indigo-600',
          bgColor: 'bg-indigo-50',
        },
      ];
    }

    if (user?.role === 'admin') {
      return [
        ...baseNotifications,
        {
          id: 3,
          type: 'course-approval',
          title: 'New Course Pending Approval',
          message: 'Dr. Sarah Johnson submitted "Advanced React Patterns" for approval.',
          timestamp: '2024-02-15T11:30:00Z',
          read: false,
          priority: 'high',
          icon: BookOpen,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
        },
        {
          id: 4,
          type: 'enrollment-approval',
          title: 'Enrollment Request Pending',
          message: 'Mike Johnson requested enrollment in Advanced JavaScript course.',
          timestamp: '2024-02-14T14:20:00Z',
          read: false,
          priority: 'medium',
          icon: Users,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
        },
        {
          id: 5,
          type: 'user-registration',
          title: 'New User Registration',
          message: 'Emily Davis registered as a new instructor.',
          timestamp: '2024-02-13T10:15:00Z',
          read: true,
          priority: 'low',
          icon: Users,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
        },
        {
          id: 6,
          type: 'system-alert',
          title: 'High Server Load Detected',
          message: 'Server load is above normal. Consider scaling resources.',
          timestamp: '2024-02-12T22:30:00Z',
          read: true,
          priority: 'high',
          icon: AlertCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
        },
      ];
    }

    return baseNotifications;
  };

  useEffect(() => {
    setNotifications(getNotificationsForRole());
  }, [user]);

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffTime = Math.abs(now - notificationTime);
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notificationTime.toLocaleDateString();
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-300';
    }
  };

  const getFilterOptions = () => {
    const baseOptions = [
      { value: 'all', label: 'All', count: notifications.length },
      { value: 'unread', label: 'Unread', count: unreadCount },
    ];

    if (user?.role === 'student') {
      return [
        ...baseOptions,
        { value: 'assignment', label: 'Assignments', count: notifications.filter(n => n.type === 'assignment').length },
        { value: 'grade', label: 'Grades', count: notifications.filter(n => n.type === 'grade').length },
        { value: 'discussion', label: 'Discussions', count: notifications.filter(n => n.type === 'discussion').length },
        { value: 'deadline', label: 'Deadlines', count: notifications.filter(n => n.type === 'deadline').length },
      ];
    }

    if (user?.role === 'instructor') {
      return [
        ...baseOptions,
        { value: 'submission', label: 'Submissions', count: notifications.filter(n => n.type === 'submission').length },
        { value: 'enrollment', label: 'Enrollments', count: notifications.filter(n => n.type === 'enrollment').length },
        { value: 'discussion', label: 'Discussions', count: notifications.filter(n => n.type === 'discussion').length },
        { value: 'analytics', label: 'Analytics', count: notifications.filter(n => n.type === 'analytics').length },
      ];
    }

    if (user?.role === 'admin') {
      return [
        ...baseOptions,
        { value: 'course-approval', label: 'Course Approvals', count: notifications.filter(n => n.type === 'course-approval').length },
        { value: 'enrollment-approval', label: 'Enrollment Approvals', count: notifications.filter(n => n.type === 'enrollment-approval').length },
        { value: 'user-registration', label: 'User Registrations', count: notifications.filter(n => n.type === 'user-registration').length },
        { value: 'system-alert', label: 'System Alerts', count: notifications.filter(n => n.type === 'system-alert').length },
      ];
    }

    return baseOptions;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3">
          <Bell className="h-6 w-6 text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Notifications</h1>
            <p className="text-secondary-600">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-primary-600 hover:text-primary-700 font-medium text-sm"
            >
              Mark all as read
            </button>
          )}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-secondary-600 hover:text-secondary-900 rounded-lg hover:bg-secondary-100"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-secondary-200">
        <div className="flex flex-wrap gap-2">
          {getFilterOptions().map((filterOption) => (
            <button
              key={filterOption.value}
              onClick={() => setFilter(filterOption.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                filter === filterOption.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
              }`}
            >
              {filterOption.label} ({filterOption.count})
            </button>
          ))}
        </div>
      </div>

      {/* Notification Settings */}
      {showSettings && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-secondary-200">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Notification Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-secondary-900">Email Notifications</h4>
                <p className="text-sm text-secondary-600">Receive notifications via email</p>
              </div>
              <input type="checkbox" className="toggle" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-secondary-900">Push Notifications</h4>
                <p className="text-sm text-secondary-600">Receive browser push notifications</p>
              </div>
              <input type="checkbox" className="toggle" defaultChecked />
            </div>
            {user?.role === 'student' && (
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-secondary-900">Assignment Reminders</h4>
                  <p className="text-sm text-secondary-600">Get reminded about upcoming deadlines</p>
                </div>
                <input type="checkbox" className="toggle" defaultChecked />
              </div>
            )}
            {user?.role === 'instructor' && (
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-secondary-900">Submission Alerts</h4>
                  <p className="text-sm text-secondary-600">Get notified when students submit assignments</p>
                </div>
                <input type="checkbox" className="toggle" defaultChecked />
              </div>
            )}
            {user?.role === 'admin' && (
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-secondary-900">System Alerts</h4>
                  <p className="text-sm text-secondary-600">Receive critical system notifications</p>
                </div>
                <input type="checkbox" className="toggle" defaultChecked />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.map((notification) => {
          const Icon = notification.icon;
          return (
            <div
              key={notification.id}
              className={`bg-white rounded-xl p-4 shadow-sm border-l-4 ${getPriorityColor(notification.priority)} ${
                !notification.read ? 'border border-primary-200 bg-primary-50' : 'border border-secondary-200'
              } transition-all duration-200 hover:shadow-md`}
            >
              <div className="flex items-start space-x-4">
                <div className={`p-2 rounded-lg ${notification.bgColor}`}>
                  <Icon className={`h-5 w-5 ${notification.color}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className={`font-medium ${!notification.read ? 'text-secondary-900' : 'text-secondary-700'}`}>
                        {notification.title}
                      </h4>
                      <p className="text-sm text-secondary-600 mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-secondary-500">
                        {notification.courseName && <span>{notification.courseName}</span>}
                        <span>{getTimeAgo(notification.timestamp)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-primary-600 hover:text-primary-700 text-xs font-medium"
                        >
                          Mark as read
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="p-1 text-secondary-400 hover:text-secondary-600 rounded"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredNotifications.length === 0 && (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 mb-2">No notifications</h3>
          <p className="text-secondary-600">
            {filter === 'unread' ? 'All notifications have been read' : 'You have no notifications at the moment'}
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
