const { MailerSend, EmailParams, Sender, Recipient } = require('mailersend');
const hbs = require('hbs');
const fs = require('fs');
const path = require('path');

// Load the template file
const templatePath = path.join(__dirname, '../views/clientConfirmation0.hbs');
const template = fs.readFileSync(templatePath, 'utf-8');

// Define the sendEmail function
const sendEmail0 = async (data) => {
    try {
        const mailerSend = new MailerSend({
            apiKey: 'mlsn.46499151b1bbbc49eb4fabc1805cde2e4702ba546dc8a0a70f7af20271e26990', // Use your API key stored in environment variables
        });

        const sentFrom = new Sender("info@trial-ynrw7gyp9wjg2k8e.mlsender.net", "eremovals");

        const recipients = [new Recipient(data.clientEmail, data.clientName)];

        // Render the template with Handlebars and dynamic data
        const htmlContent = hbs.handlebars.compile(template)(data);

        const emailParams = new EmailParams()
            .setFrom(sentFrom)
            .setTo(recipients)
            .setReplyTo(sentFrom)
            .setSubject("Your Removal Job Request Has Been Received")
            .setHtml(htmlContent)
            .setText("We received your information");

        await mailerSend.email.send(emailParams);
        console.log('Email sent successfully!');
    } catch (error) {
        console.error('Failed to send email:', error);
    }
};

// Export the sendEmail function as a module
module.exports = {
    sendEmail0
};
