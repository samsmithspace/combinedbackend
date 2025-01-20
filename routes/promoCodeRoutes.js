// routes/promoCodeRoutes.js
const express = require('express');
const Booking = require('../models/Booking');
const PromptCode = require('../models/PromptCode');
const router = express.Router();

router.get('/getall', async (req, res) => {
    try {
        console.log("getall");
        const codes = await PromptCode.find();
        res.json(codes);
    } catch (error) {
        console.error('Error fetching promotion codes:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});
router.post('/add', async (req, res) => {
    const { codeName, description, discountPercent } = req.body;

    // Validate the required fields
    if (!codeName || !discountPercent) {
        return res.status(400).send({ error: 'codeName and discountPercent are required fields.' });
    }

    try {
        // Check if the codeName already exists
        const existingCode = await PromptCode.findOne({ codeName: codeName.toUpperCase() });
        if (existingCode) {
            return res.status(400).send({ error: 'This promotion code already exists.' });
        }

        // Create a new PromptCode
        const newPromptCode = new PromptCode({
            codeName: codeName.toUpperCase(),
            description,
            discountPercent,
        });

        // Save the new PromptCode to the database
        await newPromptCode.save();

        res.status(201).json({
            message: 'Promotion code added successfully!',
            promptCode: newPromptCode,
        });
    } catch (error) {
        console.error('Error adding new promotion code:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});


// DELETE route to delete a promotion code by ID
router.delete('/delete/:codeName', async (req, res) => {
    try {
        const codeName = req.params.codeName.toUpperCase();  // Convert to uppercase if necessary

        // Check if the promotion code exists by codeName
        const promptCode = await PromptCode.findOne({ codeName });
        if (!promptCode) {
            return res.status(404).send({ error: 'Promotion code not found' });
        }

        // Delete the promotion code
        await PromptCode.findOneAndDelete({ codeName });

        res.status(200).send({ message: 'Promotion code deleted successfully' });
    } catch (error) {
        console.error('Error deleting promotion code:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});


router.post('/', async (req, res) => {
    const { codeName, description } = req.body;
    try {
        const newPromptCode = new PromptCode({ codeName, description });
        await newPromptCode.save();
        res.json(newPromptCode);
    } catch (error) {
        console.error('Error adding promotion code:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const updatedPromptCode = await PromptCode.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedPromptCode);
    } catch (error) {
        console.error('Error updating promotion code:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

router.post('/:id/apply-promo', async (req, res) => {
    const bookingId = req.params.id;
    const { promoCode } = req.body;

    if (promoCode.length !== 6) {
        return res.status(400).send({ error: 'Invalid promotion code. It must be exactly 6 characters long.' });
    }

    try {
        // Fetch the promotion code from the database
        const promptCode = await PromptCode.findOne({ codeName: promoCode.toUpperCase() });

        if (!promptCode) {
            return res.status(400).send({ error: 'Invalid promotion code' });
        }

        const discountPercent = promptCode.discountPercent; // Assuming you add a `discountPercent` field to the PromptCode schema

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
            discount: discountPercent,
            discountedPrice: booking.price,
            discountedHelperPrice: booking.helperprice,
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
            helperprice: booking.helperprice,
        });
    } catch (error) {
        console.error('Error fetching latest price:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

module.exports = router;


