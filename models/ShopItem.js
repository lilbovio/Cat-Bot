const mongoose = require('mongoose');

const shopItemSchema = new mongoose.Schema({
    guildId:  { type: String, required: true },
    itemName: { type: String, required: true },
    price:    { type: Number, required: true, min: 1 },
    roleId:   { type: String, required: true },
});

shopItemSchema.index({ guildId: 1, itemName: 1 }, { unique: true });

module.exports = mongoose.model('ShopItem', shopItemSchema);
