require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const driverRoutes = require('./routes/driverRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

// Initialize Express
const app = express();
const allowedOrigins = ['https://van-removal-platform-eremovals.vercel.app', 'https://driver-system-gilt.vercel.app','http://localhost:3000','http://localhost:3002','http://localhost:3001'];

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use(bodyParser.json());

// Routes
app.use('/api/driver', driverRoutes);
app.use('/api/bookings', bookingRoutes);

module.exports = app;
