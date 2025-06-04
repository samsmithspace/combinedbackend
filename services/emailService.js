const axios = require('axios');
const hbs = require('hbs');
const fs = require('fs');
const path = require('path');

// Load the template file
const templatePath = path.join(__dirname, '../views/jobDetails.hbs');
const template = fs.readFileSync(templatePath, 'utf-8');

// Define the sendEmail function
const sendEmail = async (data) => {
    try {
        // Render the template with Handlebars and dynamic data
        const htmlContent = hbs.handlebars.compile(template)(data);

        // Brevo API endpoint
        const url = 'https://api.brevo.com/v3/smtp/email';

        // Email payload for Brevo
        const emailData = {
            sender: {
                name: "Eremovals",
                email: process.env.SENDER_EMAIL // ← From environment variable
            },
            to: [
                {
                    email: data.driveremail,
                    name: data.drivername
                }
            ],
            subject: "New Removal Job Assigned to You",
            htmlContent: htmlContent,
            textContent: "You have a new job assigned"
        };

        // Headers for Brevo API
        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'api-key': process.env.BREVO_API_KEY // Your Brevo API key
        };

        // Send the email
        const response = await axios.post(url, emailData, { headers });

        console.log('Email sent successfully!');
        console.log('Message ID:', response.data.messageId);

        console.log('API Key loaded:', process.env.BREVO_API_KEY ? 'Yes' : 'No');
        console.log('Sender Email loaded:', process.env.SENDER_EMAIL ? 'Yes' : 'No');

        if (!process.env.BREVO_API_KEY) {
            console.error('BREVO_API_KEY environment variable is not set!');
            return;
        }

        if (!process.env.SENDER_EMAIL) {
            console.error('SENDER_EMAIL environment variable is not set!');
            return;
        }

        return response.data;

    } catch (error) {
        console.error('Failed to send email:', error.response?.data || error.message);
        throw error;
    }
};

// Export the sendEmail function as a module
module.exports = {
    sendEmail
};