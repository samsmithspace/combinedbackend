function getCombinedUnavailableDays(drivers) {
    // Initialize the first driver's weekdays off as the base for intersection
    let intersectedWeekdaysOff = new Set(drivers[0].offDays);
    let intersectedSpecificDatesOff = new Set(drivers[0].specificOffDates);

    // Function to find the intersection of two sets
    function intersectSets(set1, set2) {
        return new Set([...set1].filter(item => set2.has(item)));
    }

    // Function to get the day of the week from a date string (YYYY-MM-DD)
    function getDayOfWeek(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { weekday: 'long' });
    }

    // First pass: find the intersection of weekdays off for all drivers
    drivers.forEach(driver => {
        intersectedWeekdaysOff = intersectSets(intersectedWeekdaysOff, new Set(driver.offDays));
    });

    // Second pass: find the intersection of specific dates off for all drivers
    drivers.forEach(driver => {
        intersectedSpecificDatesOff = intersectSets(intersectedSpecificDatesOff, new Set(driver.specificOffDates));
    });

    // Final pass: filter specificDatesOff to ensure no overlap with weekdaysOff
    intersectedSpecificDatesOff = new Set([...intersectedSpecificDatesOff].filter(date => {
        const dayOfWeek = getDayOfWeek(date);
        return !intersectedWeekdaysOff.has(dayOfWeek); // Only keep dates that do not fall on intersected weekdays
    }));

    // Convert Sets to Arrays for the final result
    return {
        weekdaysOff: Array.from(intersectedWeekdaysOff),
        specificDatesOff: Array.from(intersectedSpecificDatesOff)
    };
}

module.exports = {
    getCombinedUnavailableDays
};
