require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');

// Import your route files
const driverRoutes = require('./routes/driverRoutes');
const bookingRoutes = require('./routes/createBookingRoutes'); // Import the new booking creation route
const contactRoutes = require('./routes/contactRoutes'); // Import the new contact route
const promoCodeRoutes = require('./routes/promoCodeRoutes'); // Import the new promo code route
const priceItemRoutes = require('./routes/priceItem');
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
app.use('/api/driver', driverRoutes);          // Driver-related routes
app.use('/api/bookings', bookingRoutes);       // Booking creation-related routes
app.use('/api/bookings', contactRoutes);       // Contact update-related routes under bookings
app.use('/api/promocode', promoCodeRoutes);    // Promo code-related routes

module.exports = app;
