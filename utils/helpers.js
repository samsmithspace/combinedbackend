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
function countBoxesBySize(details) {
    // Initialize variables to store the counts for each box size
    let smallCount = 0;
    let mediumCount = 0;
    let largeCount = 0;
    let extraLargeCount = 0;

    // Iterate through the box details to count the number of boxes for each size
    details.boxDetails.forEach(box => {
        switch (box.boxSize) {
            case 'small':
                smallCount += box.numberOfBoxes;
                break;
            case 'medium':
                mediumCount += box.numberOfBoxes;
                break;
            case 'large (or heavier than 20 kg)':
                largeCount += box.numberOfBoxes;
                break;
            case 'Extra large':
                extraLargeCount += box.numberOfBoxes;
                break;
            default:
                // Handle any unexpected box sizes if needed
                break;
        }
    });

    // Return an array with the counts in the order: [small, medium, large, extraLarge]
    return [smallCount, mediumCount, largeCount, extraLargeCount];
}

function calculateDistancePrice(startDistance, destDistance, distance) {
    // Extract the numeric value from the distance string
    const distanceValue = parseFloat(distance);

    let price = 0;

    // Determine the price based on the given conditions
    if (startDistance < 5 && destDistance < 5) {
        price = 0; // Both distances are less than 5 miles
    } else if (distanceValue > 5 && distanceValue < 20) {

        price = distanceValue * 1.6;
    } else if (distanceValue >= 20 && distanceValue < 60) {

        price = distanceValue * 1.6;
    } else if (distanceValue >= 60) {
        price = distanceValue * 1.6;

    }

    return price;
}
function calculatePrice(details) {
    const liftAvailable = details.liftAvailable;
    const numberOfStairs = details.numberOfStairs;
    const liftAvailableDest = details.liftAvailabledest;
    const numberOfStairsRight = details.numberofstairsright;

    if (numberOfStairs === 0 && numberOfStairsRight === 0) {
        return 0;
    }

    if (liftAvailable && liftAvailableDest) {
        return 15;
    }

    if ((liftAvailable && !liftAvailableDest) || (!liftAvailable && liftAvailableDest)) {
        return (liftAvailable ? numberOfStairsRight : numberOfStairs) * 15;
    }

    return (numberOfStairs + numberOfStairsRight) * 15;
}
module.exports = {
    extractTimeStrings,
    countBoxesBySize,
    calculateDistancePrice,
    calculatePrice
};
