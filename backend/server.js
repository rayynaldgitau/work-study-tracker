const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const shiftRoutes = require('./routes/shifts');
const stationRoutes = require('./routes/stations');
const departmentRoutes = require('./routes/departments');
const adminRoutes = require('./routes/admin');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '1mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (_req, res) => res.json({ status: 'ok', service: 'Work-Study Tracker API' }));

// 404
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));
