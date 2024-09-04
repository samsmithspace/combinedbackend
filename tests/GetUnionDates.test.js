const { getCombinedUnavailableDays } = require('../utils/GetUnionDates');
const DriverUnavailability = require('../models/DriverUnavailability'); // Ensure this path is correct

describe('getCombinedUnavailableDays with Database Data', () => {
    let driversData;

    beforeAll(async () => {
        // Fetch data from the database, assuming the database is already connected
        try {
            driversData = await DriverUnavailability.find({}).lean();
            console.log('Fetched driver data:', driversData);
        } catch (error) {
            console.error('Error fetching driver data:', error);
        }
    });

    it('should print combined unavailable days from database data', () => {
        if (!driversData || driversData.length === 0) {
            console.warn('No driver data available in the database for testing.');
            return;
        }

        // Process the data for use with getCombinedUnavailableDays
        const formattedDrivers = driversData.map(driver => ({
            offDays: driver.unavailableDates, // Use the correct field names from your schema
            specificOffDates: driver.weeklyUnavailability // Use the correct field names from your schema
        }));

        // Call the function with the fetched data
        const result = getCombinedUnavailableDays(formattedDrivers);

        // Log the output of the function
        console.log('Combined Unavailable Days Output:', result);
    });
});
