// services/emailService.js
const axios = require('axios');
const hbs = require('hbs');
const fs = require('fs');
const path = require('path');

// Register Handlebars helpers
hbs.registerHelper('eq', function(a, b) {
    return a === b;
});

hbs.registerHelper('unless', function(conditional, options) {
    if (!conditional) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

// Load the original template file
const templatePath = path.join(__dirname, '../views/jobDetails.hbs');
const template = fs.readFileSync(templatePath, 'utf-8');

// Load the manager inquiry template
const managerTemplatePath = path.join(__dirname, '../views/managerInquiry.hbs');
const managerTemplate = fs.readFileSync(managerTemplatePath, 'utf-8');

// Original sendEmail function for job assignments
const sendEmail = async (data) => {
    try {
        const htmlContent = hbs.handlebars.compile(template)(data);

        const url = 'https://api.brevo.com/v3/smtp/email';

        const emailData = {
            sender: {
                name: "Eremovals",
                email: process.env.SENDER_EMAIL
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

        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'api-key': process.env.BREVO_API_KEY
        };

        const response = await axios.post(url, emailData, { headers });

        console.log('Email sent successfully!');
        console.log('Message ID:', response.data.messageId);

        return response.data;

    } catch (error) {
        console.error('Failed to send email:', error.response?.data || error.message);
        throw error;
    }
};

// New function to send email notification to manager for customer inquiries
const sendEmailToManager = async (inquiryData) => {
    try {
        console.log('Sending email notification to manager...');

        if (!process.env.BREVO_API_KEY) {
            console.error('BREVO_API_KEY environment variable is not set!');
            throw new Error('Email service not configured');
        }

        if (!process.env.SENDER_EMAIL) {
            console.error('SENDER_EMAIL environment variable is not set!');
            throw new Error('Sender email not configured');
        }

        if (!process.env.MANAGER_EMAIL) {
            console.error('MANAGER_EMAIL environment variable is not set!');
            throw new Error('Manager email not configured');
        }

        // Render the template with inquiry data
        const htmlContent = hbs.handlebars.compile(managerTemplate)(inquiryData);

        const url = 'https://api.brevo.com/v3/smtp/email';

        const emailData = {
            sender: {
                name: "Eremovals - Customer Inquiry System",
                email: process.env.SENDER_EMAIL
            },
            to: [
                {
                    email: process.env.MANAGER_EMAIL,
                    name: "Manager"
                }
            ],
            replyTo: {
                email: inquiryData.customerEmail !== 'Not provided' ? inquiryData.customerEmail : process.env.SENDER_EMAIL,
                name: inquiryData.customerName
            },
            subject: `🏠 New Customer Inquiry - ${inquiryData.customerName} (${inquiryData.moveDate})`,
            htmlContent: htmlContent,
            textContent: `New customer inquiry from ${inquiryData.customerName}. 
            Contact: ${inquiryData.customerPhone}
            Move from: ${inquiryData.startLocation} to ${inquiryData.destinationLocation}
            Date: ${inquiryData.moveDate} at ${inquiryData.moveTime}
            Estimated price: £${inquiryData.estimatedPrice}`
        };

        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'api-key': process.env.BREVO_API_KEY
        };

        const response = await axios.post(url, emailData, { headers });

        console.log('Manager notification email sent successfully!');
        console.log('Message ID:', response.data.messageId);

        return response.data;

    } catch (error) {
        console.error('Failed to send manager notification email:', error.response?.data || error.message);
        throw error;
    }
};

module.exports = {
    sendEmail,
    sendEmailToManager
};