// services/twilioService.js
const twilio = require('twilio');

const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const phoneNumber = process.env.PHONE;
const managerPhoneNumber = process.env.MANAGER_PHONE; // Add this to your .env file

const twilioClient = twilio(twilioAccountSid, twilioAuthToken);

// Original function to send a WhatsApp message for job assignments
const sendWhatsAppMessage = async (data) => {
    try {
        const message = await twilioClient.messages.create({
            contentSid: "HXbbee96613ce59bacf9b94fedd8e0b548",
            contentVariables: JSON.stringify({ 1: data.clientName + ", " + data.clientPhone }),
            from: 'whatsapp:+442038185939',
            messagingServiceSid: "MG30c690b5b9b778631ccdfcf2139b4031",
            to: `whatsapp:+44${phoneNumber}`,
        });

        console.log('WhatsApp message sent:', message.sid);
    } catch (error) {
        console.error('Failed to send WhatsApp message:', error);
    }
};

// New function to send WhatsApp notification to manager for customer inquiries
const sendWhatsAppMessageToManager = async (inquiryData) => {
    try {
        const message = await twilioClient.messages.create({
            contentSid: "HXc79ff338db911824ba59a44b363ed01f",
            contentVariables: JSON.stringify({ 1:inquiryData.customerName, 2: inquiryData.customerPhone}),
            from: 'whatsapp:+442038185939',
            messagingServiceSid: "MG30c690b5b9b778631ccdfcf2139b4031",
            to: `whatsapp:+44${phoneNumber}`,
        });

        console.log('WhatsApp manager message sent:', message.sid);
    } catch (error) {
        console.error('Failed to send manager WhatsApp message:', error);
    }
};



module.exports = {
    sendWhatsAppMessage,
    sendWhatsAppMessageToManager
};