function parseTime(timeStr) {
    // Parse time from 'HH:MM' format and return the total minutes since midnight
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
}

function isTimeWithinRange(start, end, checkStart, checkEnd) {
    // Check if the given time range (checkStart, checkEnd) is within the driver's working range (start, end)
    return start <= checkStart && end >= checkEnd;
}

function getDayOfWeek(dateStr) {
    // Create a date object from the date string (format: "YYYY-MM-DD")
    const date = new Date(dateStr);
    // Get the day of the week as a string (e.g., "Monday")
    return date.toLocaleDateString('en-US', { weekday: 'long' });
}

function isDriverAvailable(driver, desiredDate, desiredStart, desiredEnd) {
    // Get the day of the week for the desired date
    const desiredDay = getDayOfWeek(desiredDate);

    // Check if the driver is NOT off on the desired day and desired date
    const isOffOnWeeklyDay = driver.offDays.includes(desiredDay);
    const isOffOnSpecificDate = driver.specificOffDates.includes(desiredDate);

    if (isOffOnWeeklyDay || isOffOnSpecificDate) {
        return false;
    }

    // Parse the driver's working time
    const [driverStart, driverEnd] = driver.workingTime.split('-').map(parseTime);

    // Check if the desired time range is within the driver's working time range
    return isTimeWithinRange(driverStart, driverEnd, desiredStart, desiredEnd);
}

function filterAvailableDrivers(drivers, desiredDate, desiredTimeRange) {
    // Split desired time range into start and end times
    const [desiredStart, desiredEnd] = desiredTimeRange.split('-').map(parseTime);

    // Initialize an array to store available drivers
    const availableDrivers = [];

    // Iterate through each driver
    drivers.forEach(driver => {
        if (isDriverAvailable(driver, desiredDate, desiredStart, desiredEnd)) {
            availableDrivers.push(driver.name);
        }
    });

    return availableDrivers;
}
module.exports = {
    filterAvailableDrivers
};