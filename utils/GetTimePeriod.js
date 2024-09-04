function getAvailableTimePeriods(drivers, specificDate) {
    const dayOfWeek = getDayOfWeek(specificDate);
    let availablePeriods = [];

    drivers.forEach(driver => {
        const isOffToday = driver.offDays.includes(dayOfWeek) || driver.specificOffDates.includes(specificDate);

        if (!isOffToday) {
            // Parse the driver's working time and add it to availablePeriods
            const [start, end] = driver.workingTime.split('-');
            availablePeriods.push([parseTime(start), parseTime(end)]);
        }
    });

    // Merge overlapping or adjacent time periods
    availablePeriods = mergeTimePeriods(availablePeriods);

    // Convert the merged periods back to 'HH:MM-HH:MM' format
    return availablePeriods.map(period => `${formatTime(period[0])}-${formatTime(period[1])}`);
}

function getDayOfWeek(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
}

function parseTime(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes; // Convert time to total minutes since midnight
}

function formatTime(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

function mergeTimePeriods(periods) {
    if (periods.length === 0) return [];

    // Sort periods by start time
    periods.sort((a, b) => a[0] - b[0]);

    const merged = [periods[0]];

    for (let i = 1; i < periods.length; i++) {
        const current = periods[i];
        const lastMerged = merged[merged.length - 1];

        if (current[0] <= lastMerged[1]) {
            // Overlapping or adjacent periods, merge them
            lastMerged[1] = Math.max(lastMerged[1], current[1]);
        } else {
            // No overlap, add the current period to merged periods
            merged.push(current);
        }
    }

    return merged;
}
module.exports = {
    getAvailableTimePeriods
};