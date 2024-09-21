// routes/createBookingRoutes.js
const express = require('express');
const Booking = require('../models/Booking');
const axios = require('axios');
const { calculateDistancePrice, calculatePrice} = require('../utils/helpers'); // Assuming you have helpers.js

const router = express.Router();

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

        const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
        const referencePoint = "Apex Scotland, 9 Great Stuart St, Edinburgh EH3 7TP";

        const getDistanceFromAPI = async (origin, destination) => {
            const response = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
                params: {
                    origins: origin,
                    destinations: destination,
                    travelMode: 'DRIVING',
                    key: googleMapsApiKey,
                    units: 'imperial'
                }
            });

            if (response.data.status === 'OK' && response.data.rows[0].elements[0].status === 'OK') {
                const distanceText = response.data.rows[0].elements[0].distance.text;
                return parseFloat(distanceText.split(' ')[0]);
            } else {
                throw new Error(`Error fetching distance: ${response.data.status}`);
            }
        };

        const startDistance = await getDistanceFromAPI(startLocation, referencePoint);
        const destDistance = await getDistanceFromAPI(destinationLocation, referencePoint);
        //const distprice = calculateDistancePrice(startDistance, destDistance, distance);

        let price = calculatePrice(details);
        let helperprice = calculatePrice(details);

        price = Math.max(price, process.env.BASE_PRICE);
        helperprice = Math.max(helperprice, process.env.BASE_PRICE);

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
        res.status(201).send({ message: 'Booking created', booking: newBooking });
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(400).send({ error: 'Error creating booking' });
    }
});

module.exports = router;
