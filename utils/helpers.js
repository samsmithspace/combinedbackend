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
function calculatePrice(details, ishelper) {
    const liftAvailable = details.liftAvailable;
    const numberOfStairs = details.numberOfStairs;
    const liftAvailableDest = details.liftAvailabledest;
    const numberOfStairsRight = details.numberofstairsright;

    const furnitureDetails = details.furnitureDetails || [];
    const applianceDetails = details.applianceDetails || [];

    // Box price mapping
    const boxPriceMap = {
        small: ishelper ? 4.49 : 2.99,
        medium: ishelper ? 5 : 3.69,
        large: ishelper ? 6.8 : 4.5,
        extraLarge: ishelper ? 25 : 15
    };

    // Count boxes by size
    const [smallBoxes, mediumBoxes, largeBoxes, extraLargeBoxes] = countBoxesBySize(details);

    // Calculate box price
    const boxPrice =
        (smallBoxes * boxPriceMap.small) +
        (mediumBoxes * boxPriceMap.medium) +
        (largeBoxes * boxPriceMap.large) +
        (extraLargeBoxes * boxPriceMap.extraLarge);

    // Base price calculation for stairs and lifts
    let price = 0;

    if (numberOfStairs === 0 && numberOfStairsRight === 0) {
        price = 0;
    } else if (liftAvailable && liftAvailableDest) {
        price = 15;
    } else if ((liftAvailable && !liftAvailableDest) || (!liftAvailable && liftAvailableDest)) {
        if((numberOfStairsRight === 0 &&liftAvailable)||(numberOfStairs === 0 &&liftAvailableDest)){
            price = 15;
        }else{
            price = (liftAvailable ? numberOfStairsRight : numberOfStairs) * 15;
        }

    } else {
        price = (numberOfStairs + numberOfStairsRight) * 15;
    }

    // Furniture price mapping (you can adjust prices as needed)
    const furniturePriceMap = {
        'Sofa (2-Seater)': 50,
        'Sofa (3-Seater)': 60,
        'Sofa (L-Shaped)': 80,
        'Armchair': 30,
        'Dining Table': 45,
        'Single Bed': 40,
        'Double Bed': 50,
        'Queen Bed': 60,
        'King Bed': 70,
        'Bunk Bed': 65,
        'Wardrobe (Single Door)': 35,
        'Wardrobe (Double Door)': 50,
        'Wardrobe (Sliding Door)': 55,
        'Bookcase (Small)': 20,
        'Bookcase (Large)': 30,
        'Desk': 25,
        'Nightstand': 15,
        'Cabinet': 30,
        'Ottoman': 15,
        'TV Stand': 20,
        'Office Chair': 15,
        'Dining Chair': 10,
        'Mirror (Large)': 15,
        'Mirror (Small)': 10,
        'Rug (Large)': 20,
        'Rug (Small)': 10,
        'Exercise Equipment': 40,
        'Piano': 100,
        'Bicycle': 25,
        'Motorcycle': 150,
        'Ladder': 10,
    };


    // Appliance price mapping (you can adjust prices as needed)
    const appliancePriceMap = {
        'Refrigerator (Mini)': 30,
        'Refrigerator (Standard)': 50,
        'Refrigerator (French Door)': 70,
        'Washing Machine': 40,
        'Microwave': 15,
        'Oven': 40,
        'Dishwasher': 35,
        'Stove': 40,
        'Television (Under 32")': 20,
        'Television (32"-50")': 30,
        'Television (Over 50")': 50,
        'Stereo System': 25,
        'Monitor': 15,
        'Lawn Mower': 30,
        'Hot Tub': 100,
        'Water Heater': 50,
        'Air Purifier': 15,
    };


    // Calculate the price for furniture
    const totalFurniturePrice = furnitureDetails.reduce((acc, item) => {
        const itemPrice = furniturePriceMap[item.item] || 0; // Default price is 0 if item is not in the map
        return acc + (item.quantity * itemPrice);
    }, 0);

    // Calculate the price for appliances
    const totalAppliancePrice = applianceDetails.reduce((acc, item) => {
        const itemPrice = appliancePriceMap[item.item] || 0; // Default price is 0 if item is not in the map
        return acc + (item.quantity * itemPrice);
    }, 0);

    // Add the furniture, appliance, and box costs to the total price
    price += totalFurniturePrice + totalAppliancePrice + boxPrice;

    return price;
}


module.exports = {
    extractTimeStrings,
    countBoxesBySize,
    calculateDistancePrice,
    calculatePrice
};
