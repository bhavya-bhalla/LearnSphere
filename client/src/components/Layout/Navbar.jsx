import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import {
  Bell,
  Search,
  User,
  LogOut,
  Settings,
  BookOpen,
  Menu,
  X,
} from 'lucide-react';

const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    setIsProfileOpen(false);
  };

  const toggleSidebar = () => {
    if (setSidebarOpen) {
      setSidebarOpen(!sidebarOpen);
    }
  };

  // ✅ Google Translate Integration
  useEffect(() => {
    const addTranslateScript = () => {
      if (!document.querySelector('#google-translate-script')) {
        const script = document.createElement('script');
        script.id = 'google-translate-script';
        script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        script.async = true;
        document.body.appendChild(script);
      }

      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          },
          'google_translate_element'
        );
      };
    };

    addTranslateScript();
  }, []);

  return (
    <nav className="navbar-fixed bg-white shadow-lg border-b border-secondary-200">
      <div className="navbar-container">
        <div className="navbar-content flex items-center justify-between px-4 py-2">
          {/* Logo and Google Translate */}
          <div className="flex items-center space-x-3">
            {isAuthenticated && (
              <button
                onClick={toggleSidebar}
                className="mobile-menu-button lg:hidden"
              >
                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            )}

            <Link
              to={isAuthenticated ? "/dashboard" : "/"}
              className="flex items-center space-x-2"
            >
              <div className="bg-primary-600 p-2 rounded-full">
                <BookOpen className="h-6 w-6 text-white" /> {/* Only one G-like icon now */}
              </div>
              <span className="text-lg font-semibold text-secondary-900">
                LearnSphere
              </span>
            </Link>

            {/* Google Translate Widget */}
            <div id="google_translate_element" className="ml-4 hidden sm:block" />
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Search */}
                <div className="hidden md:block">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search courses..."
                      className="input-field pl-10 text-sm"
                    />
                  </div>
                </div>

                {/* Notifications */}
                <Link
                  to="/notifications"
                  className="relative text-secondary-600 hover:text-primary-600"
                >
                  <Bell className="h-5 w-5" />
                  <span className="notification-badge">3</span>
                </Link>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2"
                  >
                    <img
                      src={
                        user?.avatar ||
                        'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150'
                      }
                      alt={user?.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    <span className="hidden sm:block text-sm font-medium">
                      {user?.name}
                    </span>
                  </button>

                  {isProfileOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsProfileOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 bg-white shadow-md rounded-md z-50">
                        <div className="px-4 py-2 border-b text-sm text-secondary-700">
                          <div className="font-semibold">{user?.name}</div>
                          <div className="text-xs capitalize">{user?.role}</div>
                        </div>
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <User className="inline mr-2 h-4 w-4" />
                          Profile
                        </Link>
                        <Link
                          to="/settings"
                          className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <Settings className="inline mr-2 h-4 w-4" />
                          Settings
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="inline mr-2 h-4 w-4" />
                          Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-secondary-600 hover:text-primary-600 text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm px-4 py-2 rounded-md"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
