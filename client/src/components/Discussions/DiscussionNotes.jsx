import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  FileText,
  Download,
  Upload,
  Plus,
  X,
  Image,
  Link as LinkIcon,
  Calendar,
  User,
  Eye,
  Edit,
  Trash2,
  BookOpen,
  Filter,
  Search,
  File,
  ExternalLink,
} from 'lucide-react';
import { mockCourses } from '../../utils/mockData';
import { eventBus, EVENTS } from '../../utils/eventBus';
import toast from 'react-hot-toast';

const DiscussionNotes = () => {
  const { user } = useSelector((state) => state.auth);
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [showCreateNote, setShowCreateNote] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [newNote, setNewNote] = useState({
    title: '',
    description: '',
    courseId: '',
    type: 'pdf', // pdf, image, link
    content: '',
    file: null,
    url: '',
    visibility: 'enrolled', // enrolled, public
  });

  useEffect(() => {
    loadNotes();

    // Listen for real-time updates
    const handleNoteCreated = (newNote) => {
      if (canViewNote(newNote)) {
        setNotes(prev => [newNote, ...prev]);
      }
    };

    eventBus.on(EVENTS.NOTE_CREATED, handleNoteCreated);

    return () => {
      eventBus.off(EVENTS.NOTE_CREATED, handleNoteCreated);
    };
  }, [user]);

  useEffect(() => {
    filterNotes();
  }, [notes, searchTerm, courseFilter, typeFilter]);

  const loadNotes = () => {
    const allNotes = JSON.parse(localStorage.getItem('discussionNotes') || '[]');
    
    // Filter notes based on user role and enrollment
    const userNotes = allNotes.filter(note => canViewNote(note));
    
    setNotes(userNotes);
  };

  const canViewNote = (note) => {
    if (user?.role === 'admin') return true;
    
    if (user?.role === 'instructor') {
      // Instructors can see notes from courses they teach
      const course = mockCourses.find(c => c.id === note.courseId);
      return course?.instructorId === user.id;
    }
    
    if (user?.role === 'student') {
      // Students can only see notes from courses they're enrolled in
      const enrolledCourses = user.enrolledCourses || [1, 2]; // Default enrolled courses for demo
      return enrolledCourses.includes(note.courseId);
    }
    
    return false;
  };

  const filterNotes = () => {
    let filtered = notes;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.courseName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Course filter
    if (courseFilter !== 'all') {
      filtered = filtered.filter(note => note.courseId === parseInt(courseFilter));
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(note => note.type === typeFilter);
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    setFilteredNotes(filtered);
  };

  const getAvailableCourses = () => {
    if (user?.role === 'instructor') {
      return mockCourses.filter(course => course.instructorId === user.id);
    } else if (user?.role === 'student') {
      const enrolledCourses = user.enrolledCourses || [1, 2];
      return mockCourses.filter(course => enrolledCourses.includes(course.id));
    }
    return mockCourses;
  };

  const handleCreateNote = () => {
    if (!newNote.title || !newNote.courseId) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (newNote.type === 'link' && !newNote.url) {
      toast.error('Please provide a valid URL');
      return;
    }

    if ((newNote.type === 'pdf' || newNote.type === 'image') && !newNote.file) {
      toast.error('Please upload a file');
      return;
    }

    const course = mockCourses.find(c => c.id === parseInt(newNote.courseId));
    
    const noteData = {
      id: Date.now(),
      ...newNote,
      courseId: parseInt(newNote.courseId),
      courseName: course?.title,
      createdBy: user?.id,
      createdByName: user?.name,
      createdAt: new Date().toISOString(),
      downloads: 0,
      views: 0,
    };

    // Save to localStorage
    const allNotes = JSON.parse(localStorage.getItem('discussionNotes') || '[]');
    allNotes.push(noteData);
    localStorage.setItem('discussionNotes', JSON.stringify(allNotes));

    // Emit event for real-time updates
    eventBus.emit(EVENTS.NOTE_CREATED, noteData);

    setNotes(prev => [noteData, ...prev]);
    setNewNote({
      title: '',
      description: '',
      courseId: '',
      type: 'pdf',
      content: '',
      file: null,
      url: '',
      visibility: 'enrolled',
    });
    setShowCreateNote(false);
    toast.success('Note created successfully!');
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size should be less than 10MB');
        return;
      }

      // Check file type
      const allowedTypes = {
        pdf: ['application/pdf'],
        image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      };

      if (!allowedTypes[newNote.type].includes(file.type)) {
        toast.error(`Please upload a valid ${newNote.type.toUpperCase()} file`);
        return;
      }

      setNewNote(prev => ({
        ...prev,
        file: {
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file), // In real app, this would be uploaded to server
        }
      }));
      toast.success('File uploaded successfully!');
    }
  };

  const handleDownload = (note) => {
    // Simulate download and update download count
    const updatedNotes = notes.map(n => 
      n.id === note.id ? { ...n, downloads: n.downloads + 1 } : n
    );
    setNotes(updatedNotes);

    // Update localStorage
    const allNotes = JSON.parse(localStorage.getItem('discussionNotes') || '[]');
    const updatedAllNotes = allNotes.map(n => 
      n.id === note.id ? { ...n, downloads: n.downloads + 1 } : n
    );
    localStorage.setItem('discussionNotes', JSON.stringify(updatedAllNotes));

    toast.success(`Downloading ${note.title}...`);
  };

  const handleDeleteNote = (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      const updatedNotes = notes.filter(note => note.id !== noteId);
      setNotes(updatedNotes);

      // Update localStorage
      const allNotes = JSON.parse(localStorage.getItem('discussionNotes') || '[]');
      const updatedAllNotes = allNotes.filter(note => note.id !== noteId);
      localStorage.setItem('discussionNotes', JSON.stringify(updatedAllNotes));

      toast.success('Note deleted successfully!');
    }
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'image':
        return <Image className="h-5 w-5 text-green-600" />;
      case 'link':
        return <LinkIcon className="h-5 w-5 text-blue-600" />;
      default:
        return <FileText className="h-5 w-5 text-red-600" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const availableCourses = getAvailableCourses();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Course Notes</h1>
          <p className="text-secondary-600 mt-1">
            {user?.role === 'instructor' 
              ? 'Share notes, documents, and resources with your students'
              : 'Access notes and resources shared by your instructors'
            }
          </p>
        </div>
        
        {user?.role === 'instructor' && availableCourses.length > 0 && (
          <button
            onClick={() => setShowCreateNote(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Note</span>
          </button>
        )}
      </div>

      {/* No Access Message */}
      {availableCourses.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-yellow-600" />
            <div>
              <h3 className="text-lg font-medium text-yellow-800">No Course Access</h3>
              <p className="text-yellow-700 mt-1">
                {user?.role === 'student' 
                  ? 'You need to be enrolled in courses to access notes. Please enroll in courses first.'
                  : 'You need to be assigned to courses to share notes. Please contact your administrator.'
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      {availableCourses.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-secondary-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 h-4 w-4" />
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="input-field pl-10 appearance-none"
              >
                <option value="all">All Courses</option>
                {availableCourses.map(course => (
                  <option key={course.id} value={course.id}>{course.title}</option>
                ))}
              </select>
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Types</option>
              <option value="pdf">PDF Documents</option>
              <option value="image">Images</option>
              <option value="link">External Links</option>
            </select>

            <div className="flex items-center text-sm text-secondary-600">
              <span>{filteredNotes.length} note{filteredNotes.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      )}

      {/* Create Note Modal */}
      {showCreateNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-secondary-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-secondary-900">Create New Note</h3>
                <button
                  onClick={() => setShowCreateNote(false)}
                  className="text-secondary-400 hover:text-secondary-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Note Title *
                </label>
                <input
                  type="text"
                  value={newNote.title}
                  onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                  className="input-field"
                  placeholder="Enter note title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Course *
                </label>
                <select
                  value={newNote.courseId}
                  onChange={(e) => setNewNote(prev => ({ ...prev, courseId: e.target.value }))}
                  className="input-field"
                >
                  <option value="">Select a course</option>
                  {availableCourses.map(course => (
                    <option key={course.id} value={course.id}>{course.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newNote.description}
                  onChange={(e) => setNewNote(prev => ({ ...prev, description: e.target.value }))}
                  className="input-field h-24 resize-none"
                  placeholder="Brief description of the note"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Note Type
                </label>
                <select
                  value={newNote.type}
                  onChange={(e) => setNewNote(prev => ({ ...prev, type: e.target.value, file: null, url: '' }))}
                  className="input-field"
                >
                  <option value="pdf">PDF Document</option>
                  <option value="image">Image</option>
                  <option value="link">External Link</option>
                </select>
              </div>

              {newNote.type === 'link' ? (
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Link URL *
                  </label>
                  <input
                    type="url"
                    value={newNote.url}
                    onChange={(e) => setNewNote(prev => ({ ...prev, url: e.target.value }))}
                    className="input-field"
                    placeholder="https://example.com"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Upload {newNote.type === 'image' ? 'Image' : 'PDF'} *
                  </label>
                  <div className="border-2 border-dashed border-secondary-300 rounded-lg p-6 text-center">
                    {newNote.file ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center space-x-2">
                          {getFileIcon(newNote.type)}
                          <span className="text-sm font-medium text-secondary-900">
                            {newNote.file.name}
                          </span>
                        </div>
                        <div className="text-xs text-secondary-500">
                          {formatFileSize(newNote.file.size)}
                        </div>
                        <button
                          onClick={() => setNewNote(prev => ({ ...prev, file: null }))}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Remove File
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-secondary-400 mx-auto mb-2" />
                        <p className="text-sm text-secondary-600 mb-2">
                          Upload {newNote.type === 'image' ? 'an image' : 'a PDF document'}
                        </p>
                        <input
                          type="file"
                          accept={newNote.type === 'image' ? 'image/*' : '.pdf'}
                          onChange={handleFileUpload}
                          className="hidden"
                          id="file-upload"
                        />
                        <label
                          htmlFor="file-upload"
                          className="btn-primary cursor-pointer"
                        >
                          Choose File
                        </label>
                      </>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Visibility
                </label>
                <select
                  value={newNote.visibility}
                  onChange={(e) => setNewNote(prev => ({ ...prev, visibility: e.target.value }))}
                  className="input-field"
                >
                  <option value="enrolled">Enrolled Students Only</option>
                  <option value="public">All Students</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 px-6 py-4 border-t border-secondary-200">
              <button
                onClick={() => setShowCreateNote(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNote}
                className="btn-primary"
              >
                Create Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes List */}
      {availableCourses.length > 0 && (
        <div className="space-y-4">
          {filteredNotes.map((note) => (
            <div key={note.id} className="bg-white rounded-xl p-6 shadow-sm border border-secondary-200 card-hover">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getFileIcon(note.type)}
                    <h4 className="text-lg font-semibold text-secondary-900">{note.title}</h4>
                    <span className="bg-secondary-100 text-secondary-700 px-2 py-1 rounded-full text-xs font-medium capitalize">
                      {note.type}
                    </span>
                  </div>

                  {note.description && (
                    <p className="text-secondary-600 mb-3">{note.description}</p>
                  )}

                  <div className="flex items-center space-x-4 text-sm text-secondary-500 mb-3">
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-1" />
                      <span>{note.courseName}</span>
                    </div>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      <span>{note.createdByName}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <Download className="h-4 w-4 mr-1" />
                      <span>{note.downloads} downloads</span>
                    </div>
                  </div>

                  {/* File preview for images */}
                  {note.type === 'image' && note.file && (
                    <div className="mb-3">
                      <img
                        src={note.file.url}
                        alt={note.title}
                        className="max-w-xs h-32 object-cover rounded-lg border border-secondary-200"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  {note.type === 'link' ? (
                    <a
                      href={note.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary flex items-center space-x-1"
                      onClick={() => handleDownload(note)}
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>Open Link</span>
                    </a>
                  ) : (
                    <button
                      onClick={() => handleDownload(note)}
                      className="btn-primary flex items-center space-x-1"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download</span>
                    </button>
                  )}

                  {user?.role === 'instructor' && note.createdBy === user?.id && (
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="p-2 text-red-600 hover:text-red-700 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredNotes.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-secondary-900 mb-2">No notes available</h3>
              <p className="text-secondary-600">
                {user?.role === 'instructor' 
                  ? 'Create your first note to share with students.'
                  : 'Your instructors haven\'t shared any notes yet.'
                }
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DiscussionNotes;
