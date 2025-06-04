const axios = require('axios');

// Test function with detailed logging
const testBrevoEmail = async () => {
    try {
        console.log('🔍 Testing Brevo email sending...');
        console.log('API Key loaded:', process.env.BREVO_API_KEY ? 'Yes' : 'No');
        console.log('Sender Email loaded:', process.env.SENDER_EMAIL ? 'Yes' : 'No');
        console.log('API Key preview:', process.env.BREVO_API_KEY?.substring(0, 20) + '...');

        if (!process.env.BREVO_API_KEY) {
            console.error('❌ BREVO_API_KEY environment variable is not set!');
            return;
        }

        if (!process.env.SENDER_EMAIL) {
            console.error('❌ SENDER_EMAIL environment variable is not set!');
            return;
        }

        // Simple test email data
        const emailData = {
            sender: {
                name: "Test Sender",
                email: process.env.SENDER_EMAIL // ← From environment variable
            },
            to: [
                {
                    email: "your-actual-email@gmail.com", // ← CHANGE THIS TO YOUR REAL EMAIL
                    name: "Test Recipient"
                }
            ],
            subject: "Brevo Test Email - " + new Date().toLocaleString(),
            htmlContent: `
                <h1>Test Email from Brevo</h1>
                <p>This is a test email sent at: ${new Date().toLocaleString()}</p>
                <p>If you receive this, Brevo is working correctly!</p>
            `,
            textContent: "This is a test email from Brevo. If you receive this, it's working!"
        };

        console.log('📧 Sending email to:', emailData.to[0].email);

        // Brevo API endpoint
        const url = 'https://api.brevo.com/v3/smtp/email';

        // Headers
        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'api-key': process.env.BREVO_API_KEY
        };

        console.log('🚀 Making API request...');

        // Send the email
        const response = await axios.post(url, emailData, { headers });

        console.log('✅ Email sent successfully!');
        console.log('📊 Response status:', response.status);
        console.log('🆔 Message ID:', response.data?.messageId);
        console.log('📋 Full response:', response.data);

        console.log('\n🔍 Next steps:');
        console.log('1. Check your email inbox (including spam folder)');
        console.log('2. Check Brevo dashboard → Transactional → Statistics');
        console.log('3. Look for delivery status in Brevo logs');

        return response.data;

    } catch (error) {
        console.error('❌ Failed to send email:');
        console.error('Status:', error.response?.status);
        console.error('Status Text:', error.response?.statusText);
        console.error('Error Data:', error.response?.data);
        console.error('Error Message:', error.message);

        // Common error meanings
        if (error.response?.status === 401) {
            console.log('\n💡 This is an authentication error. Check:');
            console.log('- Your API key is correct');
            console.log('- API key is properly set in .env file');
            console.log('- No extra spaces in the API key');
        } else if (error.response?.status === 400) {
            console.log('\n💡 This is a bad request error. Check:');
            console.log('- Email format is correct');
            console.log('- All required fields are provided');
        }

        throw error;
    }
};

// Run the test
testBrevoEmail();