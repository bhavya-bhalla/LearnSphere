const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  level: String,
  duration: String,
  maxStudents: Number,
  startDate: Date,
  endDate: Date,
  price: Number,
  prerequisites: String,
  objectives: String,
  syllabus: String,
  imageUrl: String,
  instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
