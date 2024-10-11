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
            'EREMOV': 10, // 10% discount
            'MVTRXB': 40,
            'KILFNS': 35,
            'OSNJPF': 30,
            'BJSALM': 25,
            'IJNLFG': 20

        };

        const discountPercent = validPromoCodes[promoCode.toUpperCase()];

        if (!discountPercent) {
            return res.status(400).send({ error: 'Invalid promotion code' });
        }

        // Find the booking by ID
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).send({ error: 'Booking not found' });
        }

        // Check if a promo code has already been applied
        if (booking.promoCodeApplied) {
            return res.status(400).send({ error: 'A promo code has already been applied to this booking.' });
        }

        // Remove VAT (divide by 1.2)
        let originalPrice = booking.price / 1.2;
        let originalHelperPrice = booking.helperprice / 1.2;

        // Apply discount
        const discountedPrice = originalPrice * (1 - discountPercent / 100);
        const discountedHelperPrice = originalHelperPrice * (1 - discountPercent / 100);

        // Add VAT back
        booking.price = parseFloat((discountedPrice * 1.2).toFixed(2));
        booking.helperprice = parseFloat((discountedHelperPrice * 1.2).toFixed(2));

        // Mark the promo code as applied
        booking.promoCodeApplied = true;

        // Save the updated booking
        await booking.save();

        res.status(200).send({
            message: `Promo code applied! You received a ${discountPercent}% discount.`,
            discount: discountPercent
            //discountedPrice: booking.price,
            //discountedHelperPrice: booking.helperprice
        });
    } catch (error) {
        console.error('Error applying promo code:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

router.get('/:id/latest-price', async (req, res) => {
    const bookingId = req.params.id;

    try {
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).send({ error: 'Booking not found' });
        }

        // Return the latest price and helperprice
        res.status(200).json({
            price: booking.price,
            helperprice: booking.helperprice
        });
    } catch (error) {
        console.error('Error fetching latest price:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

module.exports = router;
