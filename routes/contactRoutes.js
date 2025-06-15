// routes/contactRoutes.js
const express = require('express');
const Booking = require('../models/Booking');
const { sendWhatsAppMessage } = require('../services/twilioService');
const { sendEmail } = require('../services/emailService');
const { sendEmail0 } = require('../services/emailServiceToClient0');
const { countBoxesBySize } = require('../utils/helpers'); // Assuming you have helpers.js in utils folder

const router = express.Router();

// Update booking with contact information and send WhatsApp message
router.post('/:id/contact', async (req, res) => {
    try {
        const bookingId = req.params.id;
        const { name, phone, email } = req.body;

        const updatedBooking = await Booking.findByIdAndUpdate(
            bookingId,
            { name, phone, email },
            { new: true }
        );

        if (!updatedBooking) {
            return res.status(404).send({ error: 'Booking not found' });
        }

        // Send WhatsApp message after updating contact information
        //await sendWhatsAppMessage(updatedBooking);

        res.status(200).send({ message: 'Contact information added and WhatsApp message sent', booking: updatedBooking });
    } catch (error) {
        console.error('Error updating booking with contact information:', error);
        res.status(400).send({ error: 'Error updating booking with contact information' });
    }
});

// Send booking information via WhatsApp and Email
router.post('/:id/send', async (req, res) => {
    try {
        const bookingId = req.params.id;
        const updatedBooking = await Booking.findById(bookingId);

        if (!updatedBooking) {
            return res.status(404).send({ error: 'Booking not found' });
        }

        const boxsizes = countBoxesBySize(updatedBooking.details);

        const jobData = {
            clientName: updatedBooking.name,
            clientPhone: updatedBooking.phone,
            clientEmail: updatedBooking.email,
            startAddress: updatedBooking.startLocation,
            destinationAddress: updatedBooking.destinationLocation,
            distance: updatedBooking.distance,
            moveDate: updatedBooking.date,
            moveTime: updatedBooking.time,
            smallBoxes: boxsizes[0],
            mediumBoxes: boxsizes[1],
            largeBoxes: boxsizes[2],
            extraLargeBoxes: boxsizes[3],
            furnitureDetails: updatedBooking.details.furnitureDetails,
            applianceDetails: updatedBooking.details.applianceDetails,
            liftStart: updatedBooking.details.liftAvailable,
            stairsStart: updatedBooking.details.numberOfStairs,
            liftDestination: updatedBooking.details.liftAvailabledest,
            stairsDestination: updatedBooking.details.numberofstairsright,
            estimatedPrice: updatedBooking.price,
            estimatedPriceWithHelper: updatedBooking.helperprice,
            drivername: "Isaac",
            driveremail: process.env.EMAIL
        };

        await sendWhatsAppMessage(jobData);
        await sendEmail(jobData);
        await sendEmail0(jobData);

        res.status(200).send({ message: 'Booking information sent', booking: updatedBooking });
    } catch (error) {
        console.error('Error sending booking information:', error);
        res.status(400).send({ error: 'Error sending booking information' });
    }
});

module.exports = router;
