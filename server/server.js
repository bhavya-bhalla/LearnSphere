const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authroutes');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// 👉 Swagger setup goes here
require("./swagger")(app);

// Routes
app.use('/api/auth', authRoutes);

// DB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/learningsphere', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connected successfully');
  app.listen(5000, () => console.log('🚀 Server running on port 5000'));
})
.catch((err) => {
  console.log('❌ DB connection error:', err.message);
});

module.exports = app; // ✅ Export app for testing
// This allows you to use `supertest` in your tests to make requests to the app
