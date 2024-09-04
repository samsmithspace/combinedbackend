// Function to extract time strings from date strings
function extractTimeStrings(dateStrings) {
    if (!dateStrings) {
        throw new Error('No date strings provided.');
    }

    const dateArray = dateStrings.split(',');

    return dateArray.map((dateString) => {
        const timePart = dateString.match(/\d{2}:\d{2}:\d{2}/);
        if (!timePart) {
            throw new Error(`Invalid date string format: ${dateString}`);
        }

        const [hours, minutes] = timePart[0].split(':');
        return `${hours}:${minutes}`;
    });
}

module.exports = {
    extractTimeStrings
};
