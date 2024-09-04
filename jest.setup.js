const mongoose = require('mongoose');

beforeAll(async () => {
    // Connect to the MongoDB database
    const dbUri = 'mongodb+srv://vandata:SYqUpnfORdE5lNpi@eremovals.3461y.mongodb.net/?retryWrites=true&w=majority&appName=eremovals';

    try {
        await mongoose.connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('MongoDB connection established successfully.');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        process.exit(1); // Exit the process with a failure code if unable to connect
    }
});

afterAll(async () => {
    try {
        await mongoose.disconnect();
        console.log('MongoDB connection closed successfully.');
    } catch (error) {
        console.error('Error disconnecting from MongoDB:', error.message);
    }
});
