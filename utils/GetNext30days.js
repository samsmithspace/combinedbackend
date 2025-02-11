function getDatesInNext30Days(weekdaysOff, specificDatesOff) {
    const result = new Set(specificDatesOff); // Use a set to avoid duplicate dates
    const currentDate = new Date();

    // Loop through the next 30 days
    for (let i = 0; i < 60; i++) {
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
    getDatesInNext30Days
};