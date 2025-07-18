const mongoose = require('mongoose');

// Booking Schema
const BookingSchema = new mongoose.Schema({
    startLocation: String,
    destinationLocation: String,
    moveType: String,
    details: Object,
    date: String,
    time: String,
    distance: String,
    price: Number,
    helperprice: Number,
    promoCodeApplied: {
        type: Boolean,
        default: false // Default is false, meaning no promo code has been applied
    },
    name: String,
    phone: String,
    email: String
});

module.exports = mongoose.model('Booking', BookingSchema);
