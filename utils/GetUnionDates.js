function getCombinedUnavailableDays(drivers) {
    // Initialize a Set to store all unique weekdays off
    const allWeekdaysOff = new Set();
    // Initialize a Set to store all unique specific dates off
    const allSpecificDatesOff = new Set();

    // First pass: collect all unique weekdays off
    drivers.forEach(driver => {
        driver.offDays.forEach(day => allWeekdaysOff.add(day));
    });

    // Second pass: collect all unique specific dates off, filtering out those that fall on the weekdays off
    drivers.forEach(driver => {
        driver.specificOffDates.forEach(date => {
            const dayOfWeek = getDayOfWeek(date);
            // Add the date only if it does not fall on any of the collected weekdays off
            if (!allWeekdaysOff.has(dayOfWeek)) {
                allSpecificDatesOff.add(date);
            }
        });
    });

    // Convert Sets to Arrays for the final result
    return {
        weekdaysOff: Array.from(allWeekdaysOff),
        specificDatesOff: Array.from(allSpecificDatesOff)
    };
}

function getDayOfWeek(dateStr) {
    // Create a date object from the date string (format: "YYYY-MM-DD")
    const date = new Date(dateStr);
    // Get the day of the week as a string (e.g., "Monday")
    return date.toLocaleDateString('en-US', { weekday: 'long' });
}

module.exports = {
    getCombinedUnavailableDays
};