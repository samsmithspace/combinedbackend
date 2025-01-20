const express = require('express');
const router = express.Router();
const PriceItem = require('../models/PriceItem');

// Get all price items
router.get('/api/price-item', async (req, res) => {
    try {
        console.log("Get all price items");
        const items = await PriceItem.find();
        res.json(items);
    } catch (error) {
        console.error("Error fetching price items:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Add a new price item
router.post('/', async (req, res) => {
    try {
        console.log("Add new price item");
        const { itemName, category, normalPrice, helperPrice } = req.body;
        const newItem = new PriceItem({ itemName, category, normalPrice, helperPrice });
        await newItem.save();
        res.status(201).json(newItem);
    } catch (error) {
        console.error("Error adding price item:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Update an existing price item
router.put('/:id', async (req, res) => {
    try {
        console.log("Update price item");
        const updatedItem = await PriceItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedItem) {
            return res.status(404).json({ message: "Price item not found" });
        }
        res.json(updatedItem);
    } catch (error) {
        console.error("Error updating price item:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Delete a price item by name
router.delete('/:itemName', async (req, res) => {
    try {
        console.log("Delete price item");
        const { itemName } = req.params;
        const deletedItem = await PriceItem.findOneAndDelete({ itemName });
        if (!deletedItem) {
            return res.status(404).json({ message: "Price item not found" });
        }
        res.json({ message: "Price item deleted successfully", deletedItem });
    } catch (error) {
        console.error("Error deleting price item:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
