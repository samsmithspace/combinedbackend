const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const DriverUnavailability = require('../models/DriverUnavailability');
const { extractTimeStrings } = require('../utils/helpers');
const { getCombinedUnavailableDays } = require('../utils/GetUnionDates'); // Import the function
const { getDatesInNext30Days } = require('../utils/GetNext30days');
const { getAvailableTimePeriods } = require('../utils/GetTimePeriod'); // Import getAvailableTimePeriods
const router = express.Router();

// Register a new driver
router.post('/register', async (req, res) => {
    const { driverName, password } = req.body;

    if (!driverName || !password) {
        return res.status(400).send('Driver name and password are required');
    }

    const driverId = Math.floor(100000 + Math.random() * 900000).toString();

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const newDriver = new DriverUnavailability({
            driverId,
            driverName,
            password: hashedPassword
        });

        await newDriver.save();
        res.status(201).json({ driverId });
    } catch (error) {
        console.error('Error registering driver:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Login a driver
router.post('/login', async (req, res) => {
    const { driverId, password } = req.body;

    if (!driverId || !password) {
        return res.status(400).send('Driver ID and password are required');
    }

    try {
        const driver = await DriverUnavailability.findOne({ driverId });
        if (!driver) {
            return res.status(404).send('Driver not found');
        }

        const isMatch = await bcrypt.compare(password, driver.password);
        if (!isMatch) {
            return res.status(401).send('Invalid credentials');
        }

        const token = jwt.sign({ driverId: driver.driverId }, 'your_jwt_secret', { expiresIn: '1h' });

        res.json({ token });
    } catch (error) {
        console.error('Error logging in driver:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Fetch driver unavailability
router.get('/unavailability', async (req, res) => {
    const { driverId } = req.query;

    if (!driverId) {
        return res.status(400).send('Driver ID is required');
    }

    try {
        const driver = await DriverUnavailability.findOne({ driverId });

        if (!driver) {
            return res.status(404).send('Driver not found');
        }

        res.json({
            unavailableDates: driver.unavailableDates,
            weeklyUnavailability: driver.weeklyUnavailability,
            workingHours: driver.workingHours
        });
    } catch (error) {
        console.error('Error fetching driver unavailability:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Update driver unavailability
router.post('/unavailability', async (req, res) => {
    const { driverId, unavailableDates, weeklyUnavailability, workingHours } = req.body;

    if (!driverId) {
        return res.status(400).send('Driver ID is required');
    }

    try {
        const driver = await DriverUnavailability.findOne({ driverId });

        if (!driver) {
            return res.status(404).send('Driver not found');
        }

        if (Array.isArray(unavailableDates)) {
            driver.unavailableDates = unavailableDates;
        }
        if (Array.isArray(weeklyUnavailability)) {
            driver.weeklyUnavailability = weeklyUnavailability;
        }
        if (Array.isArray(workingHours)) {
            const extractedTimes = extractTimeStrings(workingHours.join(','));

            driver.workingHours = extractedTimes;
        }

        await driver.save();
        res.status(200).send('Unavailability updated');
    } catch (error) {
        console.error('Error updating driver unavailability:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Delete driver unavailability
router.delete('/unavailability', async (req, res) => {
    const { driverId, datesToDelete } = req.body;

    if (!driverId) {
        return res.status(400).send('Driver ID is required');
    }

    if (!Array.isArray(datesToDelete) || datesToDelete.length === 0) {
        return res.status(400).send('No dates specified for deletion');
    }

    try {
        const result = await DriverUnavailability.updateOne(
            { driverId },
            { $pull: { unavailableDates: { $in: datesToDelete } } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).send('Driver not found or no dates to delete');
        }

        res.status(200).send('Dates deleted successfully');
    } catch (error) {
        console.error('Error deleting unavailable dates:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Fetch all drivers' unavailable dates and apply getCombinedUnavailableDays
router.get('/getdate', async (req, res) => {
    try {
        const drivers = await DriverUnavailability.find({}).lean();

        if (!drivers || drivers.length === 0) {
            return res.status(404).send({ error: 'No drivers found' });
        }

        const formattedDrivers = drivers.map(driver => ({
            offDays: driver.unavailableDates,
            specificOffDates: driver.weeklyUnavailability
        }));

        const combinedUnavailableDays = getCombinedUnavailableDays(formattedDrivers);

        const result = getDatesInNext30Days(combinedUnavailableDays.specificDatesOff, combinedUnavailableDays.weekdaysOff);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching driver data:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

// Fetch available time periods for drivers based on a specific date
router.get('/available-time-periods', async (req, res) => {
    const { date } = req.query;

    if (!date) {
        return res.status(400).send({ error: 'Date query parameter is required' });
    }

    try {
        const drivers = await DriverUnavailability.find({}).lean();

        if (!drivers || drivers.length === 0) {
            return res.status(404).send({ error: 'No drivers found in the database' });
        }

        const formattedDrivers = drivers.map(driver => ({
            offDays: driver.unavailableDates,
            specificOffDates: driver.weeklyUnavailability,
            workingTime: driver.workingHours.join('-')
        }));

        const availableTimePeriods = getAvailableTimePeriods(formattedDrivers, date);

        res.status(200).json({ availableTimePeriods });
    } catch (error) {
        console.error('Error calculating available time periods:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});


module.exports = router;
