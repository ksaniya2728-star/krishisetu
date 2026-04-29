require('express-async-errors');
const express = require('express');
const cors = require('cors');
const { errorHandler, notFound } = require('./middleware/error');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
