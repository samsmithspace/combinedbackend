// models/PromptCode.js
const mongoose = require('mongoose');

const PromptCodeSchema = new mongoose.Schema({
    codeName: { type: String, required: true, unique: true },
    description: String,
    discountPercent: { type: Number, required: true }, // Add discountPercent field
    createdDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PromptCode', PromptCodeSchema);