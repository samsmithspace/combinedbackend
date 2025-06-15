// routes/createBookingRoutes.js
const express = require('express');
const Booking = require('../models/Booking');
const axios = require('axios');
const { calculateDistancePrice, calculatePrice } = require('../utils/helpers'); // Assuming you have helpers.js

const router = express.Router();
// This is your test secret API key.
const stripe = require('stripe')(process.env.STRIP);
const app = express();
app.use(express.static('public'));
const YOUR_DOMAIN = process.env.DOM;

// Route to fetch booking details by booking ID
router.get('/:bookingId', async (req, res) => {
    try {
        const bookingId = req.params.bookingId;

        // Fetch the booking details using the booking ID
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).send({ error: 'Booking not found' });
        }

        res.status(200).send({ booking });
    } catch (error) {
        console.error('Error fetching booking:', error);
        res.status(500).send({ error: 'Error fetching booking' });
    }
});

router.post('/:id/create-checkout-session-helper', async (req, res) => {
    try {
        const { bookingId, amount, lang } = req.body;

// If bookingId is an object, like { id: '...' }, fix it:
        const realBookingId = typeof bookingId === 'object' && bookingId.id ? bookingId.id : bookingId;

// Then use realBookingId
        const booking = await Booking.findById(realBookingId);
        if (!booking) {
            return res.status(404).send({ error: 'Booking not found' });
        }

        const helperPriceInPence = Math.round(booking.helperprice * 100);

        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price_data: {
                        currency: 'gbp',
                        product_data: {
                            name: 'Move Service with Helper',
                        },
                        unit_amount: helperPriceInPence,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${YOUR_DOMAIN}/${lang}/booking-result?bookingId=${bookingId}`,
            cancel_url: `${YOUR_DOMAIN}/${lang}/payment-cancelled`,
        });

        res.status(200).send({ sessionId: session.id });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).send({ error: 'Error creating checkout session' });
    }
});

router.post('/:id/create-checkout-session', async (req, res) => {
    try {

        const { bookingId, amount, lang } = req.body;

// If bookingId is an object, like { id: '...' }, fix it:
        const realBookingId = typeof bookingId === 'object' && bookingId.id ? bookingId.id : bookingId;

// Then use realBookingId
        const booking = await Booking.findById(realBookingId);
        if (!booking) {
            return res.status(404).send({ error: 'Booking not found' });
        }
        if (!booking) {
            return res.status(404).send({ error: 'Booking not found' });
        }

        const priceInPence = Math.round(booking.price * 100);

        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price_data: {
                        currency: 'gbp',
                        product_data: {
                            name: 'Move Service',
                        },
                        unit_amount: priceInPence,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${YOUR_DOMAIN}/${lang}/booking-result?bookingId=${bookingId}`,
            cancel_url: `${YOUR_DOMAIN}/${lang}/payment-cancelled`,
        });

        res.status(200).send({ sessionId: session.id });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).send({ error: 'Error creating checkout session' });
    }
});

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

        // Get distances from the start and destination locations to the reference point
        const startDistance = await getDistanceFromAPI(startLocation, referencePoint);
        const destDistance = await getDistanceFromAPI(destinationLocation, referencePoint);
        const dest = await getDistanceFromAPI(startLocation, destinationLocation);
        // Parse base price from environment variables
        const basePrice = parseFloat(process.env.BASE_PRICE) || 0;
        console.log("Calculate distance price")
        console.log(startDistance, destDistance, dest)
        console.log("******************")
        // Calculate distance price
        const distprice = calculateDistancePrice(startDistance, destDistance, dest);

        // Calculate initial prices using await
        let price = await calculatePrice(details, false);
        let helperprice = await calculatePrice(details, true);

        // Debug logs for initial prices
        console.log('Initial price:', price);
        console.log('Initial helper price:', helperprice);
        console.log('Base price from env:', process.env.BASE_PRICE, 'Parsed base price:', basePrice);

        console.log("distance price", distprice)

        // Ensure price and helperprice are valid numbers
        if (isNaN(price) || isNaN(helperprice)) {
            throw new Error('Calculated price or helper price is not a valid number.');
        }

        // Add distance price and ensure minimum base price
        price = Math.max(price, basePrice) + distprice;
        helperprice = Math.max(helperprice, basePrice) + distprice;


        if(helperprice<=300){
            helperprice *= 1.3;
        }

        // Apply any multipliers (e.g., for taxes or fees)
        price *= 1.2;
        helperprice *= 1.2;

        // Debug logs after calculations
        console.log('Price after calculations:', price);
        console.log('Helper price after calculations:', helperprice);

        // Round prices to two decimal places
        price = parseFloat(price.toFixed(2));
        helperprice = parseFloat(helperprice.toFixed(2));

        // Ensure final prices are valid numbers
        if (isNaN(price) || isNaN(helperprice)) {
            throw new Error('Final price or helper price is not a valid number.');
        }

        // Create a new booking instance
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

        // Save the booking to the database
        await newBooking.save();

        // Send a success response with the new booking
        res.status(201).send({ message: 'Booking created', booking: newBooking });
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(400).send({ error: 'Error creating booking' });
    }
});
module.exports = router;