const twilio = require('twilio');

const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const phoneNumber = process.env.PHONE;

const twilioClient = twilio(twilioAccountSid, twilioAuthToken);

// Function to send a WhatsApp message
const sendWhatsAppMessage = async (data) => {

    try {
        const message = await twilioClient.messages.create({
            contentSid: "HXbbee96613ce59bacf9b94fedd8e0b548",
            contentVariables: JSON.stringify({ 1: data.clientName+", "+data.clientPhone }),
            from: 'whatsapp:+442038185939',  // Twilio sandbox WhatsApp number
            messagingServiceSid: "MG30c690b5b9b778631ccdfcf2139b4031",
            to: `whatsapp:+44${phoneNumber}`,  // Customer's WhatsApp number
        });

        console.log('WhatsApp message sent:', message.sid);
    } catch (error) {
        console.error('Failed to send WhatsApp message:', error);
    }
};

module.exports = {
    sendWhatsAppMessage
};
