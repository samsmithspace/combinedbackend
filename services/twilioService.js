const twilio = require('twilio');

const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const phoneNumber = process.env.PHONE;

const twilioClient = twilio(twilioAccountSid, twilioAuthToken);

// Function to send a WhatsApp message
const sendWhatsAppMessage = async () => {

    const messageBody = "New Booking! Please check email."
    try {
        const message = await twilioClient.messages.create({
            from: 'whatsapp:++442038185939',  // Twilio sandbox WhatsApp number
            to: `whatsapp:+44${phoneNumber}`,  // Customer's WhatsApp number
            body: messageBody
        });

        console.log('WhatsApp message sent:', message.sid);
    } catch (error) {
        console.error('Failed to send WhatsApp message:', error);
    }
};

module.exports = {
    sendWhatsAppMessage
};
