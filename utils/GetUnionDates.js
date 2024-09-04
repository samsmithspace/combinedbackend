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

function getDatesInNext30Days(weekdaysOff, specificDatesOff) {
    const result = new Set(specificDatesOff); // Use a set to avoid duplicate dates
    const currentDate = new Date();
    const dayMap = {
        "Sunday": 0,
        "Monday": 1,
        "Tuesday": 2,
        "Wednesday": 3,
        "Thursday": 4,
        "Friday": 5,
        "Saturday": 6
    };

    // Loop through the next 30 days
    for (let i = 0; i < 30; i++) {
        const date = new Date(currentDate);
        date.setDate(currentDate.getDate() + i);
        const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });

        // Check if the day of the week is in weekdaysOff
        if (weekdaysOff.includes(dayOfWeek)) {
            result.add(date.toISOString().split('T')[0]); // Add date in YYYY-MM-DD format
        }
    }

    // Convert the Set to an array and sort it
    return Array.from(result).sort((a, b) => new Date(a) - new Date(b));
}

module.exports = {
    getCombinedUnavailableDays
};