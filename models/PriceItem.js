const mongoose = require('mongoose');

const PriceItemSchema = new mongoose.Schema({
    itemName: { type: String, required: true },
    category: { type: String, required: true },
    normalPrice: { type: Number, required: true }, // Ensure type is Number and required
    helperPrice: { type: Number, required: true }  // Ensure type is Number and required
});

module.exports = mongoose.model('PriceItem', PriceItemSchema);
