const mongoose = require('mongoose');

// Driver Unavailability Schema
const driverUnavailabilitySchema = new mongoose.Schema({
    driverId: { type: String, required: true, unique: true },
    driverName: { type: String, required: true },
    password: { type: String, required: true },
    unavailableDates: { type: [String], default: [] },
    weeklyUnavailability: { type: [String], default: [] },
    workingHours: { type: [String], default: [null, null] }
});

module.exports = mongoose.model('DriverUnavailability', driverUnavailabilitySchema);
