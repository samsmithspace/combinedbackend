const express = require('express');
const Booking = require('../models/Booking');
const { sendWhatsAppMessage } = require('../services/twilioService');

const router = express.Router();

// Save a booking and send a WhatsApp message
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
                    default:
                        return total;
                }
            }, 0);

            // Additional cost for stairs if lift is not available
            if (!details.liftAvailable) {
                price += details.numberOfStairs * 2;
                helperprice += details.numberOfStairs * 2;
            }
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
        await sendWhatsAppMessage(newBooking);
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
