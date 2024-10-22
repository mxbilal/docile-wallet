const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  itemCode: { type: String, unique: true }, // Item Code should be unique
  productPicture: String,
  productName: String,
  mrpInInr: Number,
  discountedPrice: Number,
  priceInInr: Number,
  cash_back: {
    type: Number,
    default: 0
  },
  weight: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ["active", "in-active"],
    default: "active"
  }
});

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;
