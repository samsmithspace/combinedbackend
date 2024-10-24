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
        'Sofa (2-Seater)': 35,
        'Sofa (3-Seater)': 50,
        'Sofa (L-Shaped)': 50,
        'Armchair': 60,
        'Dining Table': 30,
        'Single Bed': 40,
        'Double Bed': 50,
        'Queen Bed': 50,
        'King Bed': 50,
        'Bunk Bed': 60,
        'Wardrobe (Single Door)': 50,
        'Wardrobe (Double Door)': 60,
        'Wardrobe (Sliding Door)': 60,
        'Bookcase (Small)': 25,
        'Bookcase (Large)': 40,
        'Desk': 40,
        'Nightstand': 15,
        'Cabinet': 40,
        'Ottoman': 55,
        'TV Stand': 40,
        'Office Chair': 30,
        'Dining Chair': 15,
        'Mirror (Large)': 30,
        'Mirror (Small)': 30,
        'Rug (Large)': 40,
        'Rug (Small)': 30,
        'Exercise Equipment': 30,
        'Bicycle': 50,
        'Ladder': 40
    };



    // Appliance price mapping (you can adjust prices as needed)
    const appliancePriceMap = {
        'Refrigerator (Mini)': 30,
        'Refrigerator (Standard)': 60,
        'Refrigerator (French Door)': 80,
        'Washing Machine': 40,
        'Microwave': 15,
        'Oven': 30,
        'Dishwasher': 30,
        'Stove': 40,
        'Television (Under 32")': 25,
        'Television (32"-50")': 40,
        'Television (Over 50")': 60,
        'Stereo System': 30,
        'Monitor': 10,
        'Lawn Mower': 30,
        'Hot Tub': 650,
        'Water Heater': 5,
        'Air Purifier': 5
    };



    // Calculate the price for furniture
// Define the price threshold
    const priceThreshold = 100; // Example threshold, adjust as needed

// Calculate the price for furniture
    const totalFurniturePrice = furnitureDetails.reduce((acc, item) => {
        const itemPrice = furniturePriceMap[item.item] || 0; // Default price is 0 if item is not in the map
        const itemTotalPrice = item.quantity * itemPrice;

        if (acc + itemTotalPrice > priceThreshold) {
            // Calculate the amount above the threshold
            const amountAboveThreshold = (acc + itemTotalPrice) - priceThreshold;
            const adjustedItemTotalPrice = itemTotalPrice - amountAboveThreshold + (amountAboveThreshold * 0.3);
            return acc + adjustedItemTotalPrice;
        } else {
            return acc + itemTotalPrice;
        }
    }, 0);

// Calculate the price for appliances
    const totalAppliancePrice = applianceDetails.reduce((acc, item) => {
        const itemPrice = appliancePriceMap[item.item] || 0; // Default price is 0 if item is not in the map
        const itemTotalPrice = item.quantity * itemPrice;

        if (acc + itemTotalPrice > priceThreshold) {
            // Calculate the amount above the threshold
            const amountAboveThreshold = (acc + itemTotalPrice) - priceThreshold;
            const adjustedItemTotalPrice = itemTotalPrice - amountAboveThreshold + (amountAboveThreshold * 0.3);
            return acc + adjustedItemTotalPrice;
        } else {
            return acc + itemTotalPrice;
        }
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
