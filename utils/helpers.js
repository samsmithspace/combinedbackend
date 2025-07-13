const mongoose = require('mongoose');
const PriceItem = require('../models/PriceItem'); // Import the Mongoose model

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

// Function to count boxes by size
// Function to count boxes by size
function countBoxesBySize(details) {
    let smallCount = 0, mediumCount = 0, largeCount = 0, extraLargeCount = 0;

    details.boxDetails.forEach(box => {
        switch (box.boxSize) {
            case 'small':
                smallCount += box.numberOfBoxes;
                break;
            case 'medium':
                mediumCount += box.numberOfBoxes;
                break;
            case 'large':
            case 'large (or heavier than 20 kg)': // Support both formats
                largeCount += box.numberOfBoxes;
                break;
            case 'extraLarge':
            case 'Extra large': // Support both formats
                extraLargeCount += box.numberOfBoxes;
                break;
            default:
                console.warn(`Unknown box size: ${box.boxSize}`);
                break;
        }
    });

    return [smallCount, mediumCount, largeCount, extraLargeCount];
}

// Function to calculate distance price
function calculateDistancePrice(startDistance, destDistance, distance) {
    const distanceValue = parseFloat(distance);
    let price = 0;

    if (startDistance < 5 && destDistance < 5) {
        price = 0;
    } else if (distanceValue > 5 && distanceValue < 20) {
        price = distanceValue * 1.6;
    } else if (distanceValue >= 20 && distanceValue < 60) {
        price = distanceValue * 1.6;
    } else if (distanceValue >= 60) {
        price = distanceValue * 1.6;
    }

    return price;
}

async function calculatePrice(details, isHelper) {
    const liftAvailable = details.liftAvailable;
    const numberOfStairs = details.numberOfStairs;
    const liftAvailableDest = details.liftAvailabledest;
    const numberOfStairsRight = details.numberofstairsright;

    const furnitureDetails = details.furnitureDetails || [];
    const applianceDetails = details.applianceDetails || [];

    const boxPriceMap = {};
    const furniturePriceMap = {};
    const appliancePriceMap = {};

  //  console.log('Starting price calculation...');
   // console.log('isHelper:', isHelper);
   // console.log('Details:', JSON.stringify(details, null, 2));

    // Fetch prices from the database
    const priceItems = await PriceItem.find({});
   // console.log('Fetched price items from database:', priceItems);

    // Define mappings for box sizes (inverted)
    const boxSizeMapping = {
        'small': 'small',
        'medium': 'medium',
        'large': 'large',
        'extraLarge': 'extraLarge'
    };

    // Populate price maps with correct keys
    priceItems.forEach(item => {
        if (item.category === 'Box') {
            // Get the sizeKey directly from the mapping
            const sizeKey = boxSizeMapping[item.itemName];
          //  console.log('Processing Box:', item.itemName);
           // console.log('sizeKey:', sizeKey);
            if (sizeKey) {
                boxPriceMap[sizeKey] = isHelper ? item.helperPrice : item.normalPrice;
              //  console.log(`Set boxPriceMap[${sizeKey}] = ${boxPriceMap[sizeKey]}`);
            } else {
                console.warn(`Warning: Unknown box size '${item.itemName}'`);
            }
        } else if (item.category === 'Furniture') {
            // Use helperPrice or normalPrice based on isHelper flag
            furniturePriceMap[item.itemName] = isHelper ? item.helperPrice : item.normalPrice;
        //    console.log(`Set furniturePriceMap['${item.itemName}'] = ${furniturePriceMap[item.itemName]}`);
        } else if (item.category === 'Appliances') {
            // Use helperPrice or normalPrice based on isHelper flag
            appliancePriceMap[item.itemName] = isHelper ? item.helperPrice : item.normalPrice;
        //    console.log(`Set appliancePriceMap['${item.itemName}'] = ${appliancePriceMap[item.itemName]}`);
        } else {
            console.warn(`Warning: Unknown category '${item.category}' for item '${item.itemName}'`);
        }
    });

   // console.log('boxPriceMap:', boxPriceMap);
   // console.log('furniturePriceMap:', furniturePriceMap);
   // console.log('appliancePriceMap:', appliancePriceMap);

    // Count boxes by size
    console.log("here is the booking detail");
    console.log(details);
    console.log("-----------------");

    const [smallBoxes, mediumBoxes, largeBoxes, extraLargeBoxes] = countBoxesBySize(details);
    console.log('Box counts:', { smallBoxes, mediumBoxes, largeBoxes, extraLargeBoxes });

    // Calculate box price
    const boxPrice =
        (smallBoxes * (boxPriceMap['small'] || 0)) +
        (mediumBoxes * (boxPriceMap['medium'] || 0)) +
        (largeBoxes * (boxPriceMap['large'] || 0)) +
        (extraLargeBoxes * (boxPriceMap['extraLarge'] || 0));

    console.log('boxes price:', boxPrice);

    let price = 0;

    // Base price for stairs and lifts
    if (numberOfStairs === 0 && numberOfStairsRight === 0) {
        price = 0;
        console.log('No stairs at both locations. Base price:', price);
    } else if (liftAvailable && liftAvailableDest) {
        price = 15;
        console.log('Lift available at both locations. Base price:', price);
    } else if ((liftAvailable && !liftAvailableDest) || (!liftAvailable && liftAvailableDest)) {
        console.log('Lift available at one location.');
        if ((numberOfStairsRight === 0 && liftAvailable) || (numberOfStairs === 0 && liftAvailableDest)) {
            price = 15;
            console.log('No stairs at the location without lift. Base price:', price);
        } else {
            const stairsCount = liftAvailable ? numberOfStairsRight : numberOfStairs;
            price = stairsCount * 15;
            console.log('Stairs at the location without lift. Stairs count:', stairsCount, 'Base price:', price);
        }
    } else {
        price = (numberOfStairs + numberOfStairsRight) * 15;
        console.log('No lifts available. Total stairs:', numberOfStairs + numberOfStairsRight, 'Base price:', price);
    }

    // Define the price threshold
    const priceThreshold = 100; // Adjust the threshold as needed
    console.log('Price threshold:', priceThreshold);

    // Calculate the price for furniture with threshold logic
    let totalFurniturePrice = 0;
    totalFurniturePrice = furnitureDetails.reduce((acc, item) => {
        const itemPrice = furniturePriceMap[item.item] || 0;
        const itemTotalPrice = item.quantity * itemPrice;
        console.log(`Calculating price for furniture item '${item.item}'`);
        console.log('Item price:', itemPrice, 'Quantity:', item.quantity, 'Item total price:', itemTotalPrice);

        if (acc + itemTotalPrice > priceThreshold) {
            const amountAboveThreshold = (acc + itemTotalPrice) - priceThreshold;
            const adjustedItemTotalPrice = itemTotalPrice - amountAboveThreshold + (amountAboveThreshold * 0.3);
            console.log('Amount above threshold for furniture:', amountAboveThreshold);
            console.log('Adjusted item total price for furniture:', adjustedItemTotalPrice);
            return acc + adjustedItemTotalPrice;
        } else {
            return acc + itemTotalPrice;
        }
    }, 0);

    console.log('Total furniture price:', totalFurniturePrice);

    // Calculate the price for appliances with threshold logic
    let totalAppliancePrice = 0;
    totalAppliancePrice = applianceDetails.reduce((acc, item) => {
        const itemPrice = appliancePriceMap[item.item] || 0;
        const itemTotalPrice = item.quantity * itemPrice;
        console.log(`Calculating price for appliance item '${item.item}'`);
        console.log('Item price:', itemPrice, 'Quantity:', item.quantity, 'Item total price:', itemTotalPrice);

        if (acc + itemTotalPrice > priceThreshold) {
            const amountAboveThreshold = (acc + itemTotalPrice) - priceThreshold;
            const adjustedItemTotalPrice = itemTotalPrice - amountAboveThreshold + (amountAboveThreshold * 0.3);
            console.log('Amount above threshold for appliances:', amountAboveThreshold);
            console.log('Adjusted item total price for appliances:', adjustedItemTotalPrice);
            return acc + adjustedItemTotalPrice;
        } else {
            return acc + itemTotalPrice;
        }
    }, 0);

    console.log('Total appliance price:', totalAppliancePrice);

    // Add up all the prices
    price += totalFurniturePrice + totalAppliancePrice + boxPrice;

    if (price > 180) {
        price *= 0.85; // Apply 15% discount
    } else if (price > 90) {
        price *= 0.90; // Apply 10% discount
    }

    // Apply 30% discount on the portion over 300
    if (price > 300) {
        const excess = price - 300;
        price = 300 + (excess * 0.70); // 30% discount = pay 70% of the excess
    }

    if(isHelper){
        price*=1.1;
    }

    console.log('Final calculated price:', price);

    return price;

}

module.exports = {
    extractTimeStrings,
    countBoxesBySize,
    calculateDistancePrice,
    calculatePrice
};
