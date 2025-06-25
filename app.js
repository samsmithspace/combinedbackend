require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');

// Import your route files
const driverRoutes = require('./routes/driverRoutes');
const bookingRoutes = require('./routes/createBookingRoutes');
const contactRoutes = require('./routes/contactRoutes');
const promoCodeRoutes = require('./routes/promoCodeRoutes');
const priceItemRoutes = require('./routes/priceItem');
const managerNotificationRoutes = require('./routes/managerNotificationRoutes'); // New route

// Initialize Express
const app = express();
const allowedOrigins = [
    'https://van-removal-platform-eremovals.vercel.app',
    'https://van-removal-platform.vercel.app',
    'https://www.eremovals.uk',
    'https://driver-system-gilt.vercel.app',
    'http://localhost:3006',
    'http://localhost:3000',
    'http://localhost:3001'
];

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
app.use('/api/price-item', priceItemRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/bookings', contactRoutes);
app.use('/api/promocode', promoCodeRoutes);
app.use('/api/manager', managerNotificationRoutes); // New manager notification routes

module.exports = app;