const { sendEmail } = require('../services/emailService');

// Example data to pass to sendEmail function
const jobData = {
    clientName: "John Doe",
    clientPhone: "123-456-7890",
    clientEmail: "john.doe@example.com",
    startAddress: "123 Main St, London",
    destinationAddress: "456 Oak St, Manchester",
    distance: 100,
    moveDate: "2024-09-15",
    moveTime: "10:00 AM",
    smallBoxes: 5,
    mediumBoxes: 3,
    largeBoxes: 2,
    extraLargeBoxes: 1,
    specialItems: "Piano, Antique Vase",
    liftStart: "Available",
    stairsStart: "None",
    liftDestination: "Not Available",
    stairsDestination: "2 flights",
    estimatedPrice: 300,
    estimatedPriceWithHelper: 450,
    drivername:"Isaac",
    driveremail:"1286287511@qq.com"
};

// Call the sendEmail function with the job data
sendEmail(jobData);
