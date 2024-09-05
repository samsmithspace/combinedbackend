const express = require('express');
const Booking = require('../models/Booking');
const DriverUnavailability = require('../models/DriverUnavailability'); // Import the driver model
const { sendWhatsAppMessage } = require('../services/twilioService');
const { getCombinedUnavailableDays } = require('../utils/GetUnionDates'); // Import the function
const { getDatesInNext30Days } = require('../utils/GetNext30days');
const { getAvailableTimePeriods } = require('../utils/GetTimePeriod'); // Import getAvailableTimePeriods

const router = express.Router();
function calculateDistancePrice(startDistance, destDistance, distance) {
    // Extract the numeric value from the distance string
    const distanceValue = parseFloat(distance);

    let price = 0;

    // Determine the price based on the given conditions
    if (startDistance < 5 && destDistance < 5) {
        price = 0; // Both distances are less than 5 miles
    } else if (distanceValue > 5 && distanceValue < 20) {
        price = distanceValue * 1.6;
    } else if (distanceValue >= 20 && distanceValue < 60) {
        price = distanceValue * 1.6;
    } else if (distanceValue >= 60) {
        price = distanceValue * 1.6;
    }

    return price;
}
function calculatePrice(details) {
    const liftAvailable = details.liftAvailable;
    const numberOfStairs = details.numberOfStairs;
    const liftAvailableDest = details.liftAvailabledest;
    const numberOfStairsRight = details.numberofstairsright;

    if (numberOfStairs === 0 && numberOfStairsRight === 0) {
        return 0;
    }

    if (liftAvailable && liftAvailableDest) {
        return 20;
    }

    if ((liftAvailable && !liftAvailableDest) || (!liftAvailable && liftAvailableDest)) {
        return (liftAvailable ? numberOfStairsRight : numberOfStairs) * 20;
    }

    return (numberOfStairs + numberOfStairsRight) * 20;
}
// Route to retrieve all drivers' data and apply getCombinedUnavailableDays
router.get('/drivers/getdate', async (req, res) => {
    try {
        // Fetch all driver records from the database
        const drivers = await DriverUnavailability.find({}).lean(); // Use lean() for plain JavaScript objects

        if (!drivers || drivers.length === 0) {
            return res.status(404).send({ error: 'No drivers found in the database' });
        }

        // Format the driver data for the getCombinedUnavailableDays function
        const formattedDrivers = drivers.map(driver => ({
            offDays: driver.unavailableDates, // Adjust based on your schema
            specificOffDates: driver.weeklyUnavailability // Adjust based on your schema
        }));

        // Apply the function to get combined unavailable days
        const combinedUnavailableDays = getCombinedUnavailableDays(formattedDrivers);

        // Ensure the data is formatted correctly for getDatesInNext30Days
        const weekdaysOff = combinedUnavailableDays.weekdaysOff;
        const specificDatesOff = combinedUnavailableDays.specificDatesOff;
        //console.log(weekdaysOff);
        //console.log(specificDatesOff);
        // Now apply getDatesInNext30Days
        const result = getDatesInNext30Days(specificDatesOff,weekdaysOff);

        // Send the result back to the client
        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching driver data or applying function:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});
router.get('/drivers/available-time-periods', async (req, res) => {
    const { date } = req.query; // Expecting a query parameter named 'date'

    if (!date) {
        return res.status(400).send({ error: 'Date query parameter is required' });
    }

    try {
        // Fetch all driver records from the database
        const drivers = await DriverUnavailability.find({}).lean(); // Use lean() for plain JavaScript objects

        if (!drivers || drivers.length === 0) {
            return res.status(404).send({ error: 'No drivers found in the database' });
        }

        // Format the driver data for use with getAvailableTimePeriods
        const formattedDrivers = drivers.map(driver => ({
            offDays: driver.unavailableDates, // Adjust based on your schema
            specificOffDates: driver.weeklyUnavailability, // Adjust based on your schema
            workingTime: driver.workingHours.join('-') // Combine start and end times into 'HH:mm-HH:mm' format
        }));

        // Calculate available time periods for the specified date
        const availableTimePeriods = getAvailableTimePeriods(formattedDrivers, date);

        // Send the result back to the client
        res.status(200).json({ availableTimePeriods });
    } catch (error) {
        console.error('Error calculating available time periods:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

// Existing booking routes
const axios = require('axios');

router.post('/', async (req, res) => {
    try {
        const {
            startLocation,
            destinationLocation,
            moveType,
            details,
            date,
            time,
            distance,
            name,
            phone,
            email
        } = req.body;

        const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY; // Make sure to set this in your environment variables
        const referencePoint = "Apex Scotland, 9 Great Stuart St, Edinburgh EH3 7TP";

        // Function to check if a location is within a 5-mile radius of the reference point
        const getDistanceFromAPI = async (origin, destination) => {
            const response = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
                params: {
                    origins: origin,
                    destinations: destination,
                    travelMode: 'DRIVING',
                    key: googleMapsApiKey,
                    units: 'imperial' // For miles
                }
            });

            if (response.data.status === 'OK' && response.data.rows[0].elements[0].status === 'OK') {
                const distanceText = response.data.rows[0].elements[0].distance.text;
                return convertDistanceToMiles(distanceText);
            } else {
                throw new Error(`Error fetching distance: ${response.data.status}`);
            }
        };

        // Function to convert distance text to miles
        const convertDistanceToMiles = (distanceText) => {
            const distanceParts = distanceText.split(' ');
            const distanceValue = parseFloat(distanceParts[0]);
            const distanceUnit = distanceParts[1];

            if (distanceUnit === 'km') {
                const distanceInMiles = distanceValue * 0.621371; // Convert km to miles
                return distanceInMiles;
            } else if (distanceUnit === 'm') {
                const distanceInMiles = distanceValue * 0.000621371; // Convert meters to miles
                return distanceInMiles;
            } else {
                return distanceValue; // Already in miles or unrecognized unit
            }
        };

        // Calculate distances from startLocation and destinationLocation to the reference point
        const startDistance = await getDistanceFromAPI(startLocation, referencePoint);
        const destDistance = await getDistanceFromAPI(destinationLocation, referencePoint);

        //console.log(startDistance);
        //console.log(destDistance);

        let distprice=calculateDistancePrice(startDistance,destDistance,distance);

        // Price calculation logic
        let price = 0; // Base price
        let helperprice = 0;

        if (moveType === 'student') {
            // Calculate the price without a helper
            price += details.boxDetails.reduce((total, box) => {
                switch (box.boxSize) {
                    case 'small':
                        return total + (box.numberOfBoxes * 2.99);
                    case 'medium':
                        return total + (box.numberOfBoxes * 3.69);
                    case 'large (or heavier than 20 kg)':
                        return total + (box.numberOfBoxes * 4.5);
                    case 'Extra large':
                        return total + (box.numberOfBoxes * 15);
                    default:
                        return total;
                }
            }, 0);

            // Calculate the price with a helper
            helperprice += details.boxDetails.reduce((total, box) => {
                switch (box.boxSize) {
                    case 'small':
                        return total + (box.numberOfBoxes * 4.49);
                    case 'medium':
                        return total + (box.numberOfBoxes * 5);
                    case 'large (or heavier than 20 kg)':
                        return total + (box.numberOfBoxes * 6.8);
                    case 'Extra large':
                        return total + (box.numberOfBoxes * 25);
                    default:
                        return total;
                }
            }, 0);

            let liftprice = calculatePrice(details);
            price += liftprice;
            helperprice += liftprice;

            price += distprice;
            helperprice += distprice;
        }

        price = Math.max(price, 50);
        helperprice = Math.max(helperprice, 50);

        price *= 1.2;
        helperprice *= 1.2;

        price = parseFloat(price.toFixed(2));
        helperprice = parseFloat(helperprice.toFixed(2));

        const newBooking = new Booking({
            startLocation,
            destinationLocation,
            moveType,
            details,
            date,
            time,
            distance,
            price,
            helperprice,
            name,
            phone,
            email
        });

        await newBooking.save();

        // Send WhatsApp message
        // await sendWhatsAppMessage(newBooking);
        console.log(newBooking);
        res.status(201).send({ message: 'Booking saved and WhatsApp message sent', booking: newBooking });
    } catch (error) {
        console.error('Error saving booking or sending WhatsApp message:', error);
        res.status(400).send({ error: 'Error saving booking or sending WhatsApp message' });
    }
});


// Update booking with contact information and send WhatsApp message
router.post('/:id/contact', async (req, res) => {
    try {
        const bookingId = req.params.id;
        const { name, phone, email } = req.body;

        // Find the booking by ID and update it with the contact information
        const updatedBooking = await Booking.findByIdAndUpdate(
            bookingId,
            { name, phone, email },
            { new: true }
        );

        if (!updatedBooking) {
            return res.status(404).send({ error: 'Booking not found' });
        }

        // Send WhatsApp message after updating contact information
        await sendWhatsAppMessage(updatedBooking);

        res.status(200).send({ message: 'Contact information added and WhatsApp message sent', booking: updatedBooking });
    } catch (error) {
        console.error('Error updating booking with contact information:', error);
        res.status(400).send({ error: 'Error updating booking with contact information' });
    }
});

module.exports = router;
