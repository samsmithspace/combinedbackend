// routes/createBookingRoutes.js
const express = require('express');
const Booking = require('../models/Booking');
const axios = require('axios');
const { calculateDistancePrice, calculatePrice} = require('../utils/helpers'); // Assuming you have helpers.js

const router = express.Router();
// This is your test secret API key.
const stripe = require('stripe')('sk_test_51Q7yZiH2pNr83ttj02ujyyHIFgyPtUZJJURr0PfXFkG7INwyFTOwlYm17WZgEfI4WsePHOwqbM2U8oV1Qur3vHQB00oV73lEhS');
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
        const bookingId = req.params.id;

        const booking = await Booking.findById(bookingId);

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
            success_url: `${YOUR_DOMAIN}/booking-result?bookingId=${bookingId}`,
            cancel_url: `${YOUR_DOMAIN}/payment-cancelled`,

        });

        res.status(200).send({ sessionId: session.id });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).send({ error: 'Error creating checkout session' });
    }
});



router.post('/:id/create-checkout-session', async (req, res) => {
    try {
        const bookingId = req.params.id;

        const booking = await Booking.findById(bookingId);

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
            success_url: `${YOUR_DOMAIN}/booking-result?bookingId=${bookingId}`,
            cancel_url: `${YOUR_DOMAIN}/payment-cancelled`,

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

        const startDistance = await getDistanceFromAPI(startLocation, referencePoint);
        const destDistance = await getDistanceFromAPI(destinationLocation, referencePoint);
        const distprice = calculateDistancePrice(startDistance, destDistance, distance);

        let price = calculatePrice(details,false);
        let helperprice = calculatePrice(details,true);

        price = Math.max(price, process.env.BASE_PRICE)+distprice;
        helperprice = Math.max(helperprice, process.env.BASE_PRICE)+distprice;

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
