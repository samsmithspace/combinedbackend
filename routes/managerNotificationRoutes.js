// routes/managerNotificationRoutes.js
const express = require('express');
const { sendWhatsAppMessageToManager } = require('../services/twilioService');
const { sendEmailToManager } = require('../services/emailService');
const { countBoxesBySize } = require('../utils/helpers');

const router = express.Router();

// Send customer inquiry to manager via WhatsApp and Email
router.post('/send-inquiry', async (req, res) => {
    try {
        const {
            customerName,
            customerPhone,
            customerEmail,
            startLocation,
            destinationLocation,
            moveDate,
            moveTime,
            moveType,
            details,
            estimatedPrice,
            estimatedPriceWithHelper,
            additionalNotes
        } = req.body;

        // Validate required fields
        if (!customerName || !customerPhone || !startLocation || !destinationLocation) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: customerName, customerPhone, startLocation, destinationLocation'
            });
        }

        // Process box details if available
        let boxCounts = [0, 0, 0, 0]; // default: [small, medium, large, extraLarge]
        if (details && details.boxDetails) {
            boxCounts = countBoxesBySize(details);
        }

        // Prepare data for notifications
        const inquiryData = {
            customerName,
            customerPhone,
            customerEmail: customerEmail || 'Not provided',
            startLocation,
            destinationLocation,
            moveDate: moveDate || 'To be confirmed',
            moveTime: moveTime || 'To be confirmed',
            moveType: moveType || 'Standard move',
            smallBoxes: boxCounts[0],
            mediumBoxes: boxCounts[1],
            largeBoxes: boxCounts[2],
            extraLargeBoxes: boxCounts[3],
            furnitureDetails: details?.furnitureDetails || [],
            applianceDetails: details?.applianceDetails || [],
            liftAvailable: details?.liftAvailable || 'Not specified',
            numberOfStairs: details?.numberOfStairs || 'Not specified',
            liftAvailableDest: details?.liftAvailabledest || 'Not specified',
            numberOfStairsRight: details?.numberofstairsright || 'Not specified',
            estimatedPrice: estimatedPrice || 'To be calculated',
            estimatedPriceWithHelper: estimatedPriceWithHelper || 'To be calculated',
            additionalNotes: additionalNotes || 'None',
            inquiryDate: new Date().toLocaleDateString('en-GB'),
            inquiryTime: new Date().toLocaleTimeString('en-GB', { hour12: false })
        };

        // Send WhatsApp notification to manager
        try {
            await sendWhatsAppMessageToManager(inquiryData);
            console.log('WhatsApp notification sent to manager successfully');
        } catch (whatsappError) {
            console.error('Failed to send WhatsApp notification:', whatsappError);
            // Continue with email even if WhatsApp fails
        }

        // Send email notification to manager
        try {
            await sendEmailToManager(inquiryData);
            console.log('Email notification sent to manager successfully');
        } catch (emailError) {
            console.error('Failed to send email notification:', emailError);
            // If both fail, we should still return an error
            if (!inquiryData.whatsappSent) {
                return res.status(500).json({
                    success: false,
                    error: 'Failed to send notifications to manager'
                });
            }
        }

        res.status(200).json({
            success: true,
            message: 'Customer inquiry sent to manager successfully',
            data: {
                customerName,
                customerPhone,
                inquiryTime: inquiryData.inquiryTime
            }
        });

    } catch (error) {
        console.error('Error sending customer inquiry to manager:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error while processing inquiry'
        });
    }
});

module.exports = router;