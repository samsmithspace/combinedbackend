// routes/promoCodeRoutes.js
const express = require('express');
const Booking = require('../models/Booking');

const router = express.Router();

router.post('/:id/apply-promo', async (req, res) => {
    const bookingId = req.params.id;
    const { promoCode } = req.body;

    if (promoCode.length !== 6) {
        return res.status(400).send({ error: 'Invalid promotion code. It must be exactly 6 characters long.' });
    }

    try {
        const validPromoCodes = {
            'EREMOV': 10, // Example promo code
        };

        const discount = validPromoCodes[promoCode.toUpperCase()];

        if (!discount) {
            return res.status(400).send({ error: 'Invalid promotion code' });
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).send({ error: 'Booking not found' });
        }

        booking.discount = discount;
        await booking.save();

        res.status(200).send({ message: `Promo code applied! Discount: ${discount}% off`, discount });
    } catch (error) {
        console.error('Error applying promo code:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

module.exports = router;
